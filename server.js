// 필요한 모듈 임포트
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Express 애플리케이션 인스턴스 생성
const app = express();
const port = 3000;

// MongoDB 데이터베이스 연결 설정
mongoose.connect('mongodb://localhost:27017/BlogPlatform')
  .then(() => console.log('MongoDB connected')) // 연결 성공 시 로그 출력
  .catch(err => console.error('Error connecting to MongoDB:', err)); // 연결 실패 시 오류 로그 출력

// 블로그 포스트를 위한 Mongoose 스키마 정의
const postSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 제목 필드 (필수)
  content: { type: String, required: true }, // 내용 필드 (필수)
  author: { type: String, required: true }, // 저자 필드 (필수)
  createdAt: { type: Date, default: Date.now } // 생성 날짜 및 시간 (기본값: 현재 시간)
});

// 스키마를 사용하여 'Post' 모델 생성
const Post = mongoose.model('Post', postSchema);

// 미들웨어 설정
app.use(cors()); // CORS 미들웨어 설정
app.use(bodyParser.json()); // 요청 본문을 JSON 형태로 파싱 처리

// 라우트 설정
// 모든 포스트 조회
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts); // 조회된 포스트를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// ID를 사용해 단일 포스트 조회
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' }); // 포스트가 없을 경우 404 상태 코드로 응답
    }
    res.json(post); // 조회된 포스트를 JSON 형태로 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 발생 시 500 상태 코드로 응답
  }
});

// 새로운 포스트 생성
app.post('/posts', async (req, res) => {
  const { title, content, author } = req.body; // 요청 본문에서 제목, 내용, 저자 추출
  const post = new Post({ title, content, author }); // 새 Post 인스턴스 생성
  try {
    await post.save(); // DB에 저장
    res.status(201).json(post); // 생성된 포스트를 응답 (상태 코드 201)
  } catch (error) {
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// 포스트 업데이트
app.put('/posts/:id', async (req, res) => {
  const { title, content, author } = req.body; // 요청 본문에서 변경될 내용 추출
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { title, content, author }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' }); // 포스트가 없을 경우 404 상태 코드로 응답
    }
    res.json(updatedPost); // 업데이트된 포스트를 응답
  } catch (error) {
    res.status(400).json({ message: error.message }); // 에러 발생 시 400 상태 코드로 응답
  }
});

// 포스트 삭제
app.delete('/posts/:id', async (req, res) =>
