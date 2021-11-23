const UserService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error')

class UserController {
    async registration(req, res, next) {
        try {
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', error.array()))
            }
            const {email, password} = req.body;
            // вызываем функцию регистрации
            const userData = await UserService.registration(email, password);
            // отправляем ответ в куки (время жизни 30д)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            // Вызываем функцию логина
            const userData = await UserService.login(email, password);
            // отправляем ответ в куки (время жизни 30д)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await UserService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            // Вызываем функцию логина
            const userData = await UserService.refresh(refreshToken);
            // отправляем ответ в куки (время жизни 30д)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController();