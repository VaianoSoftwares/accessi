import Joi from "joi";

export default class Validator {
    static login(data) {
        const schema = Joi.object({
            username: Joi
                .string()
                .min(6)
                .max(32)
                .required(),
            password: Joi
                .string()
                .min(6)
                .required(),
            postazione: Joi
                .string()
                .min(3)
                .required()
        });
    
        return schema.validate(data);
    }

    static register(data) {
        const schema = Joi.object({
            username: Joi
                .string()
                .min(6)
                .max(32)
                .required(),
            password: Joi
                .string()
                .min(6)
                .required(),
            admin: Joi.bool()
        });
    
        return schema.validate(data);
    }

    static badgeDoc(data) {
        const schema = Joi.object({
            barcode: Joi
                .string()
                .min(3)
                .max(32)
                .required(),
            scadenza: Joi
                .number()
                .min(0)
                .max(24)
                .required()
        });

        return schema.validate(data);
    }

    static enumDoc(data) {
        const scheme = Joi.object({
            tipo: Joi
                .string()
                .required(),
            assegnaz: Joi
                .string()
                .required()
        });
        return scheme.validate(data);
    }
};