const jwt = require('jsonwebtoken');
const TokenModel = require('../models/token-model');
require('dotenv').config();

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, '' + process.env.JWT_ACCESS_TOKEN, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, '' + process.env.JWT_REFRESH_TOKEN_TOKEN, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, '' + process.env.JWT_ACCESS_TOKEN, );
            return userData
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, '' + process.env.JWT_REFRESH_TOKEN);
            return userData
        } catch (e) {
            return null;
        }
    }


    async saveToken(userId, refreshToken) {
        // ищем пользователя в БД
        const tokenData = await TokenModel.findOne({user: userId});
        // если такой пользователь найден, то переписываем значение refreshToken и сохраняем его
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        // если же такого пользователя не существует, то создаем новый token
        const token = TokenModel.create({
            user: userId,
            refreshToken
        })
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = TokenModel.deleteOne({refreshToken});
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = TokenModel.findOne({refreshToken});
        return tokenData;
    }
}

module.exports = new TokenService();