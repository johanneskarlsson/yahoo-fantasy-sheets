/**
 * Converts an XML string to a JSON object, using logic similar to the
 * sunset method Xml.parse().
 * @param {string} xml The XML to parse.
 * @returns {Object} The parsed XML.
 */
function xmlToJson(xml) {
  const doc = XmlService.parse(xml);
  const result = {};
  const root = doc.getRootElement();
  result[root.getName()] = elementToJson(root);
  return result;
}

/**
 * Converts an XmlService element to a JSON object, using logic similar to
 * the sunset method Xml.parse().
 * @param {XmlService.Element} element The element to parse.
 * @returns {Object} The parsed element.
 */
function elementToJson(element) {
  const result = {};

  // Attributes.
  element.getAttributes().forEach((attribute) => {
    result[attribute.getName()] = attribute.getValue();
  });

  // Child elements.
  element.getChildren().forEach((child) => {
    const key = child.getName();
    const value = elementToJson(child);

    if (result[key]) {
      if (!(result[key] instanceof Array)) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  });

  // Text content.
  if (element.getText()) {
    result["Text"] = element.getText();
  }

  return result;
}
