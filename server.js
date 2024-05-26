// 필요한 모듈 임포트
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Express 애플리케이션 인스턴스 생성
const Post = require("./models/Post"); // Post 모델 임포트
const User = require("./models/User"); // User 모델 임포트
const Category = require("./models/Category"); // Category 모델 임포트
const Comment = require("./models/Comment"); // Comment 모델 임포트
const app = express();
//const port = 3001;
const port = process.env.PORT || 3001;

// dotenv를 사용하여 .env 파일에서 환경 변수를 로드 (로컬 개발용)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// 환경 변수에서 MongoDB URI 가져오기
const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });


// MongoDB 데이터베이스 연결 설정
// mongoose
//   .connect("mongodb://localhost:27017/BlogPlatform")
//   .then(() => console.log("MongoDB connected")) // 연결 성공 시 로그 출력
//   .catch((err) => console.error("Error connecting to MongoDB:", err)); // 연결 실패 시 오류 로그 출력

// 블로그 포스트를 위한 Mongoose 스키마 정의
// const postSchema = new mongoose.Schema({
//   title: { type: String, required: true }, // 제목 필드 (필수)
//   content: { type: String, required: true }, // 내용 필드 (필수)
//   author: { type: String, required: true }, // 저자 필드 (필수)
//   createdAt: { type: Date, default: Date.now } // 생성 날짜 및 시간 (기본값: 현재 시간)
// });

// 스키마를 사용하여 'Post' 모델 생성
// const Post = mongoose.model('Post', postSchema);

// 미들웨어 설정
app.use(cors()); // CORS 미들웨어 설정
app.use(bodyParser.json()); // 요청 본문을 JSON 형태로 파싱 처리

// 라우트 설정
// 루트 URL에 GET 요청이 오면 'Hello, world!' 응답
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Users 라우트 설정
// User 생성
app.post("/users", async (req, res) => {
  const { username, email, password } = req.body; // 요청 본문에서 사용자 정보 추출
  const user = new User({ username, email, password }); // 새 User 인스턴스 생성
  try {
    await user.save(); // DB에 저장
    res.status(201).json(user); // 생성된 사용자를 응답 (상태 코드 201)
  } catch (error) {
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// User 조회
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users); // 조회된 사용자를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// ID를 사용해 단일 User 조회
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // 사용자가 없을 경우 404 상태 코드로 응답
    }
    res.json(user); // 조회된 사용자를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// User 수정
app.put("/users/:id", async (req, res) => {
  const { username, email, password } = req.body; // 요청 본문에서 변경될 내용 추출
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, password },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" }); // 사용자가 없을 경우 404 상태 코드로 응답
    }
    res.json(updatedUser); // 업데이트된 사용자를 응답
  } catch (error) {
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// User 삭제
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" }); // 사용자가 없을 경우 404 상태 코드로 응답
    }
    res.status(200).json({ message: "User deleted" }); // 삭제 성공 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// 모든 포스트 조회
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts); // 조회된 포스트를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// ID를 사용해 단일 포스트 조회
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" }); // 포스트가 없을 경우 404 상태 코드로 응답
    }
    res.json(post); // 조회된 포스트를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// 새로운 포스트 생성
app.post("/posts", async (req, res) => {
  const { title, content, username } = req.body; // 요청 본문에서 제목, 내용, 저자 추출
  console.log("Received post data:", { title, content, username }); // 요청 데이터 확인

  // 유효성 검사
  if (!title || !content || !username) {
    console.error("Validation Error: Missing required fields");
    return res
      .status(400)
      .json({ message: "Title, content, and username are required" });
  }
  const post = new Post({ title, content, username }); // 새 Post 인스턴스 생성
  try {
    await post.save(); // DB에 저장
    console.log("Post saved successfully:", post); // 성공 메시지
    res.status(201).json(post); // 생성된 포스트를 응답 (상태 코드 201)
  } catch (error) {
    console.error("Error saving post:", error); // 에러 메시지 출력
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// 포스트 업데이트
app.put("/posts/:id", async (req, res) => {
  const { title, content, username } = req.body; // 요청 본문에서 변경될 내용 추출
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, username },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" }); // 포스트가 없을 경우 404 상태 코드로 응답
    }
    res.json(updatedPost); // 업데이트된 포스트를 응답
  } catch (error) {
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// 포스트 삭제
app.delete("/posts/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" }); // 포스트가 없을 경우 404 상태 코드로 응답
    }
    res.status(200).json({ message: "Post deleted" }); // 삭제 성공 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// Category 생성
app.post("/categories", async (req, res) => {
  const { name, description } = req.body; // 요청 본문에서 카테고리 정보 추출
  const category = new Category({ name, description }); // 새 Category 인스턴스 생성
  try {
    await category.save(); // DB에 저장
    res.status(201).json(category); // 생성된 카테고리를 응답 (상태 코드 201)
  } catch (error) {
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// Category 조회
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories); // 조회된 카테고리를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// ID를 사용해 단일 Category 조회
app.get("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" }); // 카테고리가 없을 경우 404 상태 코드로 응답
    }
    res.json(category); // 조회된 카테고리를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// Category 수정
app.put("/categories/:id", async (req, res) => {
  const { name, description } = req.body; // 요청 본문에서 변경될 내용 추출
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" }); // 카테고리가 없을 경우 404 상태 코드로 응답
    }
    res.json(updatedCategory); // 업데이트된 카테고리를 응답
  } catch (error) {
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// Category 삭제
app.delete("/categories/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" }); // 카테고리가 없을 경우 404 상태 코드로 응답
    }
    res.status(200).json({ message: "Category deleted" }); // 삭제 성공 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
