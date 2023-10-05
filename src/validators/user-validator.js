const e = require("express");
const Joi = require("joi");

/// ทำ params ให้เป็นตัวเลขค่าบวก = ..../profile/11 คือเลขหลัง / จะต้องเป็นตัวเลขค่าบวก
const checkUserIdSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
});
exports.checkUserIdSchema = checkUserIdSchema;

const checkReceiverIdSchema = Joi.object({
  receiverId: Joi.number().integer().positive().required(),
});
exports.checkReceiverIdSchema = checkReceiverIdSchema;

const checkRequesterIdSchema = Joi.object({
  requesterId: Joi.number().integer().positive().required(),
});
exports.checkRequesterIdSchema = checkRequesterIdSchema;

const checkFriendIdSchema = Joi.object({
  friendId: Joi.number().integer().positive().required(),
});
exports.checkFriendIdSchema = checkFriendIdSchema;
