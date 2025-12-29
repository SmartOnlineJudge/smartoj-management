<template>
  <div class="rankings-container">    
    <div class="rankings-content">
      <!-- 高分用户榜 -->
      <div class="ranking-section">
        <h3>高分用户榜</h3>
        <div class="ranking-list">
          <div 
            v-for="(user, index) in scoreRanking" 
            :key="'score-' + user.id" 
            class="ranking-item"
          >
            <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
            <div class="user-info">
              <img :src="MINIO_URL + user.avatar" :alt="user.username" class="avatar">
              <div class="user-details">
                <span class="username">{{ user.username }}</span>
                <span class="score">{{ user.score }} 分</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户评论榜 -->
      <div class="ranking-section">
        <h3>用户评论榜</h3>
        <div class="ranking-list">
          <div 
            v-for="(user, index) in commentRanking" 
            :key="'comment-' + user.id" 
            class="ranking-item"
          >
            <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
            <div class="user-info">
              <img :src="MINIO_URL + user.avatar" :alt="user.username" class="avatar">
              <div class="user-details">
                <span class="username">{{ user.username }}</span>
                <span class="count">{{ user.commentCount }} 条评论</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户题解榜 -->
      <div class="ranking-section">
        <h3>用户题解榜</h3>
        <div class="ranking-list">
          <div 
            v-for="(user, index) in solutionRanking" 
            :key="'solution-' + user.id" 
            class="ranking-item"
          >
            <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
            <div class="user-info">
              <img :src="MINIO_URL + user.avatar" :alt="user.username" class="avatar">
              <div class="user-details">
                <span class="username">{{ user.username }}</span>
                <span class="count">{{ user.solutionCount }} 个题解</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门题目榜 -->
      <div class="ranking-section">
        <h3>热门题目榜</h3>
        <div class="ranking-list">
          <div 
            v-for="(question, index) in questionRanking" 
            :key="'question-' + question.id" 
            class="ranking-item"
          >
            <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
            <div class="question-info">
              <div class="question-details">
                <span class="question-title">{{ question.title }}</span>
                <span class="submit-count">{{ question.submitCount }} 次提交</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { 
  getRankingByScore, 
  getRankingByCommentCount, 
  getRankingBySolutionCount, 
  getPopularQuestions
} from "@/request";

const MINIO_URL = import.meta.env.VITE_MINIO_URL
const scoreRanking = ref([]);
const commentRanking = ref([]);
const solutionRanking = ref([]);
const questionRanking = ref([]);

// 根据排名返回特殊样式类
const getRankClass = (index) => {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return '';
};

onMounted(async () => {
  const [scoreResponse, commentResponse, solutionResponse, questionResponse] = await Promise.all([
    getRankingByScore(),
    getRankingByCommentCount(),
    getRankingBySolutionCount(),
    getPopularQuestions()
  ]);
  scoreRanking.value = scoreResponse.data.data.results.map(item => {
    return {
      id: item.id,
      username: item.user.user_dynamic.name,
      score: item.total_score,
      avatar: item.user.user_dynamic.avatar
    };
  })
  commentRanking.value = commentResponse.data.data.results.map(item => {
    return {
      id: item.user_id,
      username: item.name,
      commentCount: item.comment_count,
      avatar: item.avatar
    };
  })
  solutionRanking.value = solutionResponse.data.data.results.map(item => {
    return {
      id: item.user_id,
      username: item.name,
      solutionCount: item.solution_count,
      avatar: item.avatar
    };
  })
  questionRanking.value = questionResponse.data.data.map(item => {
    return {
      id: item.id,
      title: item.title,
      submitCount: item.submission_quantity
    };
  });
});
</script>

<style scoped>
.rankings-container {
  margin-top: 20px;
  border-radius: 10px;
}
.rankings-content {
  display: flex;
  justify-content: space-between;
}
.ranking-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 24%;
}
.ranking-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}
.ranking-list {
  display: flex;
  flex-direction: column;
}
.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.ranking-item:last-child {
  border-bottom: none;
}
.rank-number {
  font-weight: bold;
  font-size: 18px;
  width: 30px;
  display: inline-block;
  margin-right: 15px;
}
.rank-number.gold {
  color: #FFD700;
}
.rank-number.silver {
  color: #C0C0C0;
}
.rank-number.bronze {
  color: #CD7F32;
}
.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}
.avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}
.user-details {
  display: flex;
  flex-direction: column;
}
.username {
  font-weight: bold;
  color: #333;
}
.score, .count {
  font-size: 14px;
  color: #666;
}
.question-info {
  display: flex;
  align-items: center;
  flex: 1;
}
.question-details {
  display: flex;
  flex-direction: column;
}
.question-title {
  font-weight: bold;
  color: #333;
}
.submit-count {
  font-size: 14px;
  color: #666;
}
@media (max-width: 768px) {
  .rankings-content {
    grid-template-columns: 1fr;
  }
  
  .ranking-section {
    padding: 15px;
  }
}
</style>