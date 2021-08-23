import Joi from "joi";

const validator = data => {
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
        tipoUtente: Joi.bool()
    });

    return schema.validate(data);
};

export default validator;