const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const TokenService = require('../service/token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration(email, password) {
        // ищем пользователя по email
        const candidate = await UserModel.findOne({email});
        //если он есть, то выкидываем оишбку
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адрессом ${email} уже существует.`)
        }
        // если его нет, то создаем нового юзера
        // прячем пароль с помощью bcrypt
        const hashPassword = await bcrypt.hash(password, 3);
        // создаем нового юзера в БД
        const user = await UserModel.create({email, password: hashPassword});
        // DTO для удобной отправки данных
        const userDto = new UserDto(user)
        // генерируем пару токенов
        const tokens = TokenService.generateTokens({...userDto});
        // сохраняем токены в БД
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        // возвращаем то, что пойдет на клиент
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userDto
        }
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest(`Пользвователя с ${email} не существует`)
        }
        const isPassEquals = bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }

        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto});
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userDto
        }
    }

    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken)
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }
        const user = UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto});
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userDto
        }
    }

    async getAllUsers () {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService();