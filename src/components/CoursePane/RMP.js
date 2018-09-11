const request = require("request");
const cheerio = require("cheerio");

export async function getRMP(firstName, lastName, scraptURL) {
  return new Promise((resolve, reject) => {
    request(scraptURL, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        var url = [];
        $(".listings a").each((i, el) => {
          const namea = $(el)
            .find(".main")
            .text()
            .toUpperCase();
          const newName = namea.substring(0, namea.indexOf(","));
          const newLastName = namea.substring(namea.indexOf(","));

          if (newName === lastName && newLastName.includes(firstName))
            url.push($(el).attr("href"));
        });
        resolve(url);
        return;
      }
    });
  });
}
