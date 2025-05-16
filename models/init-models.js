var DataTypes = require("sequelize").DataTypes;
var _accounts = require("./accounts");
var _admins = require("./admins");
var _answers = require("./answers");
var _comments = require("./comments");
var _exam_attempt_details = require("./exam_attempt_details");
var _exam_attempts = require("./exam_attempts");
var _exams = require("./exams");
var _group_members = require("./group_members");
var _group_study = require("./group_study");
var _questions = require("./questions");
var _ratings = require("./ratings");
var _users = require("./users");

function initModels(sequelize) {
  var accounts = _accounts(sequelize, DataTypes);
  var admins = _admins(sequelize, DataTypes);
  var answers = _answers(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var exam_attempt_details = _exam_attempt_details(sequelize, DataTypes);
  var exam_attempts = _exam_attempts(sequelize, DataTypes);
  var exams = _exams(sequelize, DataTypes);
  var group_members = _group_members(sequelize, DataTypes);
  var group_study = _group_study(sequelize, DataTypes);
  var questions = _questions(sequelize, DataTypes);
  var ratings = _ratings(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  accounts.belongsToMany(group_study, { as: 'groupId_group_studies', through: group_members, foreignKey: "accountId", otherKey: "groupId" });
  group_study.belongsToMany(accounts, { as: 'accountId_accounts', through: group_members, foreignKey: "groupId", otherKey: "accountId" });
  admins.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasOne(admins, { as: "admin", foreignKey: "accountId"});
  comments.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasMany(comments, { as: "comments", foreignKey: "accountId"});
  exam_attempts.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasMany(exam_attempts, { as: "exam_attempts", foreignKey: "accountId"});
  exams.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasMany(exams, { as: "exams", foreignKey: "accountId"});
  group_members.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasMany(group_members, { as: "group_members", foreignKey: "accountId"});
  group_study.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasMany(group_study, { as: "group_studies", foreignKey: "accountId"});
  ratings.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasMany(ratings, { as: "ratings", foreignKey: "accountId"});
  users.belongsTo(accounts, { as: "account", foreignKey: "accountId"});
  accounts.hasOne(users, { as: "user", foreignKey: "accountId"});
  exam_attempt_details.belongsTo(answers, { as: "answer", foreignKey: "answerId"});
  answers.hasMany(exam_attempt_details, { as: "exam_attempt_details", foreignKey: "answerId"});
  exam_attempt_details.belongsTo(exam_attempts, { as: "examAttempt", foreignKey: "examAttemptId"});
  exam_attempts.hasMany(exam_attempt_details, { as: "exam_attempt_details", foreignKey: "examAttemptId"});
  comments.belongsTo(exams, { as: "exam", foreignKey: "examId"});
  exams.hasMany(comments, { as: "comments", foreignKey: "examId"});
  exam_attempts.belongsTo(exams, { as: "exam", foreignKey: "examId"});
  exams.hasMany(exam_attempts, { as: "exam_attempts", foreignKey: "examId"});
  questions.belongsTo(exams, { as: "exam", foreignKey: "examId"});
  exams.hasMany(questions, { as: "questions", foreignKey: "examId"});
  ratings.belongsTo(exams, { as: "exam", foreignKey: "examId"});
  exams.hasMany(ratings, { as: "ratings", foreignKey: "examId"});
  group_members.belongsTo(group_study, { as: "group", foreignKey: "groupId"});
  group_study.hasMany(group_members, { as: "group_members", foreignKey: "groupId"});
  answers.belongsTo(questions, { as: "question", foreignKey: "questionId"});
  questions.hasMany(answers, { as: "answers", foreignKey: "questionId"});
  exam_attempt_details.belongsTo(questions, { as: "question", foreignKey: "questionId"});
  questions.hasMany(exam_attempt_details, { as: "exam_attempt_details", foreignKey: "questionId"});

  return {
    accounts,
    admins,
    answers,
    comments,
    exam_attempt_details,
    exam_attempts,
    exams,
    group_members,
    group_study,
    questions,
    ratings,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
