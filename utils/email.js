const path = require("path");
const ejs = require("ejs");

const readTemplate = async (templateName, data, callback) => {
  try {
    const generalData = {
      siteName: process.env.SITE_NAME,
      siteUrl: process.env.SITE_URL,
    };
    Object.assign(data, generalData);
    templateName =
      typeof templateName === "string" && templateName.trim().length > 0
        ? templateName
        : false;
    data = typeof data === "object" && data !== null ? data : {};

    if (templateName) {
      const templatesDir = path.join(__dirname, "..", "/views/");

      ejs.renderFile(templatesDir + templateName + ".ejs", data, (err, str) => {
        if (!err && str) {
          callback(false, str);
        } else {
          callback(err);
        }
      });
    } else {
      callback("A valid template name wasn't specified");
    }
  } catch (err) {
    console.log("\x1b[31m%s\x1b[0m", { err });
  }
};

const returnHtml = async (templateName, data) => {
  let html;

  await readTemplate(templateName, data, (err, templateData) => {
    if (!err && templateData) {
      html = templateData;
    } else {
      throw err;
    }
  });

  return html;
};

module.exports = returnHtml;
