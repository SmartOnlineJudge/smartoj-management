import axios from "axios";

export const requests = axios.create({
    baseURL: '/api',
    withCredentials: true
})
export const aiRequests = axios.create({
    baseURL: '/ai-service',
    withCredentials: true
})


export const adminLogin = (email, password) => {
    return requests.post('/management/user/login', {email: email, password: password, auth_type: "password"})
}

export const userLogout = () => {
    return requests.post('/management/user/logout')
}

export const getCurrentAdmin = () => {
    return requests.get('/management/user')
}

export const updateAdminInfo = (name, profile) => {
    return requests.put('/user', {name: name, profile: profile})
}

export const getUserList = (page, size) => {
    return requests.get('/management/users', {
        params: {
            page: page,
            size: size
        }
    })
}

export const userLapse = (user_id, is_deleted) => {
    return requests.patch('/management/user',
        {
            user_id: user_id,
            is_deleted: is_deleted
        }
    )
}

export const getUserStatus = (page, size) => {
    return requests.get('/management/user/status', {
        params: {
            page: page,
            size: size
        }
    })
}

export const userForcedExit = (session_id) => {
    return requests.delete('/management/user',
        {
            data: {
                session_id: session_id
            }
        }
    )
}

export const getQuestions = (page, size) => {
    return requests.get('/management/questions', {
        params: {
            page: page,
            size: size
        }
    })
}

export const updatePassword = (new_password, vfcode) => {
    return requests.patch('/user/password',
        {
            new_password: new_password,
            vfcode: vfcode
        }
    )
}

export const updateEmail = (new_email, vfcode) => {
    return requests.patch('/user/email',
        {
            new_email: new_email,
            vfcode: vfcode
        }
    )
}

export const verifyCode = (recipient) => {
    return requests.post('/user/verification-code', {recipient: recipient})
}

export const checkVerifyCode = (vfcode, email) => {
    return requests.post('/user/check-verification-code', {vfcode: vfcode, email: email})
}

export const delTest = (test_id) => {
    return requests.delete('/question/test', {
            data: {
                test_id: test_id
            }
        }
    )
}

export const updateTest = (test) => {
    return requests.put('/question/test', {
        id: test.id,                     // 必须包含测试用例 ID
        input_output: test.input_output  // 必须包含测试数据
    })
}

export const addTest = (test) => {
    return requests.post('/question/test', {
        question_id: test.id,
        input_output: test.testData
    })
}

export const updateMemoryLimits = (ml_data) => {
    return requests.put('/question/memory-time-limit',
        {
            id: ml_data.id,
            time_limit: ml_data.time_limit,
            memory_limit: ml_data.memory_limit
        })
}

export const addMemoryTimeLimit = (data) => {
    return requests.post('/question/memory-time-limit', {
        question_id: data.question_id,
        language_id: data.language_id,
        time_limit: data.time_limit,
        memory_limit: data.memory_limit
    })
}

export const ReviseRevise = (question_data) => {
    return requests.put('/question',
        {
            id: question_data.id,
            title: question_data.title,
            description: question_data.description,
            difficulty: question_data.difficulty,
            is_deleted: question_data.is_deleted
        })
}

export const addQuestion = (question_data) => {
    return requests.post('/question',
        {
            title: question_data.title,
            description: question_data.description,
            difficulty: question_data.difficulty
        })
}

export const permissionDetection = (question_id) => {
    return requests.post('/question/permission-detection', {
            question_id: question_id
    })
}

export const addSolvingFramework = (code_framework,language_id,question_id) => {
    return requests.post('/question/solving-framework', {
        code_framework: code_framework,
        language_id: language_id,
        question_id: question_id
    })
}

export const reviseSolvingFramework = (id, code)=> {
    return requests.put('/question/solving-framework',{
        id:id,
        code_framework:code
    })
}

export const addJudgeTemplate = (question_id, language_id, code) => {
    return requests.post('/question/judge-template',{
        question_id: question_id,
        language_id: language_id,
        code: code
    })
}
export const reviseJudgeTemplate = (id, code)=>{
    return requests.put('/question/judge-template', {
        id:id,
        code:code
    })
}
export const addQuestionTag = (question_id, tag_id) => {
    return requests.post('/question/question-tag', {
        question_id: question_id,
        tag_id: tag_id
    })
}
export const deleteQuestionTag = (question_tag_id) => {
    return requests.delete('/question/question-tag', {
        data: {
            question_tag_id: question_tag_id
        }
    })
}

export const allTags = (requireQuestionCount) =>{
    if (requireQuestionCount === undefined) {
        requireQuestionCount = false
    }
    return requests.get('/question/tags', { params: { require_question_count: requireQuestionCount } })
}

export const createTag = (name, score) => {
    return requests.post('/management/tag', {
        name: name, 
        score: score
    })
}

export const updateTag = (tag_id, name, score) => {
    return requests.put('/management/tag', {
        tag_id: tag_id,
        name: name,
        score: score
    })
}

export const deleteTag = (tag_id, is_deleted) => {
    return requests.delete('/management/tag', {
        data: {
            tag_id: tag_id,
            is_deleted: is_deleted
        }
    })
}

export const getLanguageList= ()=>{
    return requests.get('/question/languages')
}

export const chatWithQuestionManageAgent = (query, threadID) => {
    const data = { query }
    if (threadID && threadID !== "") data["thread_id"] = threadID;
    return aiRequests.post('/chat/question-manage', data)
}

export const interruptConversation = threadID => {
    return aiRequests.post("/chat/interrupt", { thread_id: threadID })
}

export const getConversation = threadID => {
    return aiRequests.get("/conversation", { params: { thread_id: threadID } })
}

export const getConversationHistory = () => {
    return aiRequests.get("/conversation/list")
}

export const getConversationDetail = threadID => {
    return aiRequests.get(
        "/conversation/detail/question-manage", 
        { params: { thread_id: threadID } }
    )
}

export const modifyConversationTitle = (threadID, title) => {
    return aiRequests.patch(
        "/conversation",
        { thread_id: threadID, title: title }
    )
}

export const deleteConversation = threadID => {
    return aiRequests.delete(
        "/conversation",
        { data: { thread_id: threadID } }
    )
}

export const getDashboardUsers = () => {
    return requests.get('/management/dashboard/users')
}

export const getDashboardSubmissions = () => {
    return requests.get('/management/dashboard/submissions')
}

export const getDashboardSubmissionByHour = () => {
    return requests.get('management/dashboard/submission-distribution-by-hour')
}

export const getDashboardSubmissionByLanguage = () => {
    return requests.get('/management/dashboard/submission-distribution-by-language')
}

export const getDashboardConversationCount = () => {
    return aiRequests.get('/conversation/count')
}

export const getRankingByScore = () => {
    return requests.get('/management/dashboard/ranking/score')
}

export const getRankingByCommentCount = () => {
    return requests.get('/management/dashboard/ranking/comment-count')
}

export const getRankingBySolutionCount = () => {
    return requests.get('/management/dashboard/ranking/solution-count')
}

export const getPopularQuestions = () => {
    return requests.get('/question/popular-questions')
}

export const getQuestionCountBydifficulty = () => {
    return requests.get('/question/count-group-by-difficulty')
}
