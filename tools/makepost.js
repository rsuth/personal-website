const fs = require("fs");
const process = require("process");

const template = fs.readFileSync("posttemplate.html", "utf8");
const content = fs.readFileSync(process.argv[2], "utf8");
const date = process.argv[3];
const title = process.argv[4];

let post = template.replace(/{%date%}/g, date);
post = post.replace(/{%title%}/g, title);
post = post.replace(/{%content%}/g, content);

let slug = title.toLowerCase().replace(/ /g, "-");
slug = slug.replace(/[^a-z0-9-]/g, "");

fs.writeFileSync(`../blog/posts/${date}-${slug}.html`, post);

fs.readFile("../blog/index.html", "utf8", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    let newPost = `\n<li>\n<span>${date}</span>\n<a href="posts/${date}-${slug}.html">${title}</a>\n</li>\n`;
    let updated = data.replace(/<!--newpost-->/, `<!--newpost-->\n${newPost}`);
    fs.writeFileSync("../blog/index.html", updated);
  }
});
