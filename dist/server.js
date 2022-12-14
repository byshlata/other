"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var mysql2_1 = __importDefault(require("mysql2"));
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
var bodyParser = __importStar(require("body-parser"));
var Utils_1 = require("./utils/Utils");
dotenv_1["default"].config();
var app = (0, express_1["default"])();
var port = process.env.PORT || 8080;
var urlencodedParser = express_1["default"].urlencoded({ extended: false });
var pool = mysql2_1["default"].createPool({
    connectionLimit: 11,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'myApp'
}).promise();
var corsOptions = {
    credentials: true,
    optionsSuccessStatus: 200,
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE']
};
app.use((0, cors_1["default"])(corsOptions));
app.use(bodyParser.json());
app.get('/api/users', function (req, res) {
    pool.query("SELECT * FROM Users")
        .then(function (r) { return res.send(r[0]); })["catch"](function (e) { return console.log(e.message); });
});
app.post('/block-users', urlencodedParser, function (req, res) {
    var usersId = req.body.usersId;
    if (!req.body)
        return res.sendStatus(400);
    if (usersId.length > 0) {
        pool.query("UPDATE Users SET isBlocked=1 WHERE id in (".concat(usersId.join(), ")"))
            .then(function () { return pool.query("SELECT * FROM Users"); })
            .then(function (r) { return res.send(r); })["catch"](function (e) { return console.log(e.message); });
    }
});
app.post('/unblock-users', urlencodedParser, function (req, res) {
    var usersId = req.body.usersId;
    if (!req.body)
        return res.sendStatus(400);
    if (usersId.length > 0) {
        pool.query("UPDATE Users SET isBlocked=0 WHERE id in (".concat(usersId.join(), ")"))
            .then(function () { return pool.query("SELECT * FROM Users"); })
            .then(function (r) { return res.send(r); })["catch"](function (e) { return console.log(e.message); });
    }
});
app["delete"]('/delete-users', urlencodedParser, function (req, res) {
    var usersId = req.body;
    if (!req.body)
        return res.sendStatus(400);
    if (usersId.length > 0) {
        pool.query("DELETE FROM Users WHERE id in (".concat(usersId.join(), ")"))
            .then(function () { return pool.query("SELECT * FROM Users"); })
            .then(function (r) { return res.send(r); })["catch"](function (e) { return console.log(e.message); });
    }
});
app.post('/registration', urlencodedParser, function (req, res) {
    var userData = req.body;
    var today = new Date();
    if (!userData)
        return res.sendStatus(400);
    pool.query("INSERT Users(firstName, lastName, lastLogin, registrationDate, isBlocked, email, hash)\n\t\tVALUES ( \n\t\t\t\"".concat(userData.firstName, "\",\n\t\t\t\"").concat(userData.lastName, "\",\n\t\t\t\"").concat((0, Utils_1.getNowDate)(today, true), "\",\n\t\t\t\"").concat((0, Utils_1.getNowDate)(today, false), "\",\n\t\t\tFALSE,\n\t\t\t\"").concat(userData.email, "\",\n\t\t\t\"").concat((0, Utils_1.getHash)(userData.password, 256), "\");")).then(function () { return pool.query("SELECT IF (EXISTS (SELECT email FROM Users WHERE email=\"".concat(userData.email, "\"), 1,0) AS isSucceeded;")).then(function (r) { return res.send(r[0][0]); }); })["catch"](function (e) { return console.log(e.message); });
});
app.post('/authentication', urlencodedParser, function (req, res) {
    var userData = req.body;
    if (!userData)
        return res.sendStatus(400);
    pool.query("SELECT IF (EXISTS (SELECT email, hash, isBlocked FROM Users\n\t\t\tWHERE email=\"".concat(userData.email, "\" AND hash=\"").concat((0, Utils_1.getHash)(userData.password, 256), "\" AND isBlocked=0), 1,0) AS isSucceeded;")).then(function (r) { return res.send(r[0][0]); });
});
app.listen(port, function () {
    console.log("\u26A1\uFE0F[server]: Server is running at https://localhost:".concat(port));
});
