const Koa = require("koa2");
const koaBody = require("koa-body");
const koaStatic = require("koa-static");
const cors = require("koa2-cors");
const router = require("koa-router")();
const path = require("path");
const fs = require("fs");

const app = new Koa();
const port = process.env.PORT || "3000";
const uploadHost = `http://localhost:${port}/uploads/`;

app.use(cors());

app.use(
  koaBody({
    formidable: {
      //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
      uploadDir: path.resolve(__dirname, "../static/uploads"),
      keepExtensions: true,
      hash: "md5"
    },
    multipart: true // 开启文件上传，默认是关闭
  })
);

//开启静态文件访问
app.use(koaStatic(path.resolve(__dirname, "../static")));

router.get("/", async ctx => {
  ctx.body = { status: 200, message: "success", body: "hello docker" };
});

const fileHandler = file => {
  // 后缀名
  const suffix = path.extname(file.name);
  const prePath = file.path
    .split("/")
    .slice(0, -1)
    .join("/");

  const nextPath = `${prePath}/${file.hash}.${suffix}`;

  // 修改上传文件的格式
  fs.renameSync(file.path, nextPath);

  // 上传后的文件名称
  const fielName = `${file.hash}.${suffix}`;

  return { fielNam, fileUrl: `${uploadHost}${fielName}` };
};

router.post("/upload", async ctx => {
  const { files } = ctx.request;

  if (!files.file) {
    ctx.body = { message: "上传文件字段名称需为file", status: 400 };
    return;
  }

  if (!files.file.size) {
    ctx.body = { message: "请上传有效文件", status: 400 };
    return;
  }

  try {
    const data = fileHandler(files.file);
    ctx.body = { status: 200, message: "success", body: data };
  } catch (error) {
    ctx.body = { status: 500, message: error };
  }
});

app.use(router.routes()).use(router.allowedMethods());

// router.post("/upload", async ctx => {
//   const file = ctx.request.body.files.file; // 获取上传文件
//   const reader = fs.createReadStream(file.path); // 创建可读流
//   const ext = file.name.split(".").pop(); // 获取上传文件扩展名
//   const upStream = fs.createWriteStream(
//     `upload/${Math.random().toString()}.${ext}`
//   ); // 创建可写流
//   reader.pipe(upStream); // 可读流通过管道写入可写流
//   return (ctx.body = "上传成功");
// });

app.listen(port, () => {
  console.log(`start at http://localhost:${port}`);
});
