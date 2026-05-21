"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./config/app"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
// Trust proxy — required for express-rate-limit to read X-Forwarded-For correctly
app.set('trust proxy', 1);
// ─── Security middleware ──────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // Configure for production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = (0, express_rate_limit_1.default)({
    windowMs: app_1.default.rateLimit.windowMs,
    max: app_1.default.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
// ─── Body parsers & utilities ─────────────────────────────────────────────────
// Use text parser for JSON content-type so we can fix Flutter's double-encoded bodies
app.use(express_1.default.text({ type: 'application/json', limit: '10mb' }));
app.use((req, _res, next) => {
    if (typeof req.body === 'string' && req.body.length > 0) {
        try {
            req.body = JSON.parse(req.body);
        }
        catch {
            // Flutter sometimes sends "{"key":"val"}" — strip outer quotes and retry
            try {
                const stripped = req.body.trim().replace(/^"|"$/g, '');
                req.body = JSON.parse(stripped);
            }
            catch {
                req.body = {};
            }
        }
    }
    next();
});
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
// ─── HTTP logging ─────────────────────────────────────────────────────────────
if (app_1.default.env !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', {
        stream: { write: (message) => logger_1.default.http(message.trim()) },
    }));
}
// ─── Static file serving (uploads) ───────────────────────────────────────────
app.use('/uploads', express_1.default.static(path_1.default.resolve(app_1.default.upload.path)));
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MyGate API is running pratik',
        env: app_1.default.env,
        timestamp: new Date().toISOString(),
    });
});
// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', routes_1.default);
// ─── Error handling ───────────────────────────────────────────────────────────
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map