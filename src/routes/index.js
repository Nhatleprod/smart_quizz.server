const express = require("express");
const router = express.Router();

// Import tất cả các routes
const accountsRouter = require("./accounts.router");
const usersRouter = require("./users.router");
const adminsRouter = require("./admins.router");
const groupStudyRouter = require("./group_study.router");
const groupMembersRouter = require("./group_members.router");
const examsRouter = require("./exams.router");
const questionsRouter = require("./questions.router");
const commentsRouter = require("./comments.router");
const ratingsRouter = require("./ratings.router");
const examAttemptsRouter = require("./exam_attempts.router");
const exam_attempt_detailsRouter = require("./exam_attempt_details.router");
const testRouter = require("./test.router");

// Đăng ký các routes trực tiếp
router.use("/test", testRouter);
router.use("/accounts", accountsRouter);
router.use("/users", usersRouter);
router.use("/admins", adminsRouter);
router.use("/group_study", groupStudyRouter);
router.use("/group_members", groupMembersRouter);
router.use("/exams", examsRouter);
router.use("/questions", questionsRouter);
router.use("/comments", commentsRouter);
router.use("/ratings", ratingsRouter);
router.use("/exam_attempts", examAttemptsRouter);
router.use("/exam_attempt_details", exam_attempt_detailsRouter);

// Export router
module.exports = router;
