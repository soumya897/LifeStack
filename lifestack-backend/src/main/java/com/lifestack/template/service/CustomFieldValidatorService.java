package com.lifestack.template.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.template.entity.FieldDefinition;
import com.lifestack.template.entity.FieldType;
import com.lifestack.template.entity.TemplateVersion;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class CustomFieldValidatorService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final ObjectMapper objectMapper;

    public CustomFieldValidatorService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Validates a map of custom field key-values against the given TemplateVersion's field definitions.
     *
     * @param version the template version containing field definitions
     * @param values  the map of custom fields (key -> value)
     */
    public void validateCustomFields(TemplateVersion version, Map<String, Object> values) {
        if (version == null) {
            return;
        }

        Map<String, FieldDefinition> defsByKey = new HashMap<>();
        if (version.getFieldDefinitions() != null) {
            for (FieldDefinition def : version.getFieldDefinitions()) {
                defsByKey.put(def.getFieldKey(), def);
            }
        }

        Map<String, Object> inputValues = values != null ? values : Collections.emptyMap();

        // 1. Check for unknown keys
        for (String inputKey : inputValues.keySet()) {
            if (!defsByKey.containsKey(inputKey)) {
                throw new IllegalArgumentException("Unknown custom field key: '" + inputKey + "' for template version " + version.getVersionNumber());
            }
        }

        // 2. Validate each defined field
        for (FieldDefinition def : defsByKey.values()) {
            Object rawVal = inputValues.get(def.getFieldKey());

            // Required check
            if (def.isRequired()) {
                if (rawVal == null) {
                    throw new IllegalArgumentException("Custom field '" + def.getLabel() + "' (" + def.getFieldKey() + ") is required.");
                }
                if (rawVal instanceof String && ((String) rawVal).trim().isEmpty()) {
                    throw new IllegalArgumentException("Custom field '" + def.getLabel() + "' (" + def.getFieldKey() + ") cannot be blank.");
                }
                if (rawVal instanceof Collection && ((Collection<?>) rawVal).isEmpty()) {
                    throw new IllegalArgumentException("Custom field '" + def.getLabel() + "' (" + def.getFieldKey() + ") requires at least one selection.");
                }
            }

            // Skip type validations if value is null or empty string and not required
            if (rawVal == null || (rawVal instanceof String && ((String) rawVal).trim().isEmpty())) {
                continue;
            }

            // Type validations
            validateFieldType(def, rawVal);
        }
    }

    private void validateFieldType(FieldDefinition def, Object val) {
        FieldType type = def.getFieldType();
        String label = def.getLabel();

        switch (type) {
            case TEXT:
            case LONG_TEXT:
                if (!(val instanceof String)) {
                    throw new IllegalArgumentException("Field '" + label + "' must be a text string.");
                }
                break;

            case NUMBER:
                double num;
                if (val instanceof Number) {
                    num = ((Number) val).doubleValue();
                } else if (val instanceof String) {
                    try {
                        num = Double.parseDouble((String) val);
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Field '" + label + "' must be a valid number.");
                    }
                } else {
                    throw new IllegalArgumentException("Field '" + label + "' must be a number.");
                }

                // Check optional min / max bounds in config
                JsonNode configNode = parseConfig(def.getConfig());
                if (configNode.has("min") && !configNode.get("min").isNull()) {
                    double min = configNode.get("min").asDouble();
                    if (num < min) {
                        throw new IllegalArgumentException("Field '" + label + "' cannot be less than " + min);
                    }
                }
                if (configNode.has("max") && !configNode.get("max").isNull()) {
                    double max = configNode.get("max").asDouble();
                    if (num > max) {
                        throw new IllegalArgumentException("Field '" + label + "' cannot be greater than " + max);
                    }
                }
                break;

            case DATE:
                String dateStr = val.toString().trim();
                try {
                    LocalDate.parse(dateStr);
                } catch (DateTimeParseException e) {
                    throw new IllegalArgumentException("Field '" + label + "' must be a valid ISO date in YYYY-MM-DD format.");
                }
                break;

            case URL:
                String urlStr = val.toString().trim();
                if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
                    throw new IllegalArgumentException("Field '" + label + "' must be a valid URL starting with http:// or https://");
                }
                try {
                    URI uri = URI.create(urlStr);
                    if (uri.getHost() == null) {
                        throw new IllegalArgumentException("Field '" + label + "' must be a valid URL.");
                    }
                } catch (Exception e) {
                    throw new IllegalArgumentException("Field '" + label + "' has an invalid URL format.");
                }
                break;

            case EMAIL:
                String emailStr = val.toString().trim();
                if (!EMAIL_PATTERN.matcher(emailStr).matches()) {
                    throw new IllegalArgumentException("Field '" + label + "' has an invalid email format.");
                }
                break;

            case BOOLEAN:
                if (!(val instanceof Boolean)) {
                    if (val instanceof String) {
                        String s = ((String) val).toLowerCase();
                        if (!s.equals("true") && !s.equals("false")) {
                            throw new IllegalArgumentException("Field '" + label + "' must be true or false.");
                        }
                    } else {
                        throw new IllegalArgumentException("Field '" + label + "' must be a boolean.");
                    }
                }
                break;

            case SINGLE_SELECT:
                String selected = val.toString().trim();
                List<String> allowedOptions = extractOptions(def.getConfig());
                if (!allowedOptions.isEmpty() && !allowedOptions.contains(selected)) {
                    throw new IllegalArgumentException("Field '" + label + "' has invalid option '" + selected + "'. Allowed options: " + allowedOptions);
                }
                break;

            case MULTI_SELECT:
                List<String> multiOptions = extractOptions(def.getConfig());
                Collection<?> selectedItems;
                if (val instanceof Collection) {
                    selectedItems = (Collection<?>) val;
                } else if (val instanceof String[]) {
                    selectedItems = Arrays.asList((String[]) val);
                } else {
                    throw new IllegalArgumentException("Field '" + label + "' must be an array or list of selected items.");
                }

                for (Object item : selectedItems) {
                    if (item == null || !multiOptions.contains(item.toString().trim())) {
                        throw new IllegalArgumentException("Field '" + label + "' contains invalid option '" + item + "'. Allowed options: " + multiOptions);
                    }
                }
                break;
        }
    }

    private JsonNode parseConfig(String configJson) {
        if (configJson == null || configJson.trim().isEmpty()) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(configJson);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }

    private List<String> extractOptions(String configJson) {
        JsonNode configNode = parseConfig(configJson);
        if (configNode.has("options") && configNode.get("options").isArray()) {
            List<String> list = new ArrayList<>();
            for (JsonNode item : configNode.get("options")) {
                list.add(item.asText().trim());
            }
            return list;
        }
        return Collections.emptyList();
    }
}
