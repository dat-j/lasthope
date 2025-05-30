"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const workflow_module_1 = require("./modules/workflow/workflow.module");
const conversation_module_1 = require("./modules/conversation/conversation.module");
const message_module_1 = require("./modules/message/message.module");
const workflow_entity_1 = require("./entities/workflow.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'chatbot_user'),
                    password: configService.get('DB_PASSWORD', 'chatbot_password'),
                    database: configService.get('DB_DATABASE', 'chatbot_db'),
                    entities: [workflow_entity_1.Workflow, conversation_entity_1.Conversation],
                    synchronize: configService.get('NODE_ENV') === 'development',
                    logging: configService.get('NODE_ENV') === 'development',
                }),
                inject: [config_1.ConfigService],
            }),
            workflow_module_1.WorkflowModule,
            conversation_module_1.ConversationModule,
            message_module_1.MessageModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map