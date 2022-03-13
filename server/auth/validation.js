import Joi from "joi";

export default class Validator {
    static login(data) {
        const schema = Joi.object({
            postazione: Joi
                .string()
                .min(3)
                .required(),
            username: Joi
                .string()
                .min(6)
                .max(32)
                .required(),
            password: Joi
                .string()
                .min(6)
                .required(),
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
        console.log(data);
        const schema = Joi.object({
            barcode: Joi
                .string()
                .min(3)
                .max(32)
                .required(),
            descrizione: Joi.string().allow(null, ''),
            tipo: Joi.string().allow(null, ''),
            assegnazione: Joi.string().allow(null, ''),
            stato: Joi.string().allow(null, ''),
            ubicazione: Joi.string().allow(null, ''),
            nome: Joi.string().allow(null, ''),
            cognome: Joi.string().allow(null, ''),
            telefono: Joi.string().allow(null, ''),
            ditta: Joi.string().allow(null, ''),
            tdoc: Joi.string().allow(null, ''),
            ndoc: Joi.string().allow(null, ''),
            scadenza: Joi.string().allow(null, ''),
            targa1: Joi.string().allow(null, ''),
            targa2: Joi.string().allow(null, ''),
            targa3: Joi.string().allow(null, ''),
            targa4: Joi.string().allow(null, '')
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

    static timbra(data) {
        const scheme = Joi.object({
            barcode: Joi
                .string()
                .min(3)
                .max(32)
                .required(),
            tipo: Joi
                .string()
                .required(),
            postazione: Joi
                .string()
                .required(),
            nome: Joi.string().allow(null, ''),
            cognome: Joi.string().allow(null, ''),
            ditta: Joi.string().allow(null, ''),
            telefono: Joi.string().allow(null, ''),
            tdoc: Joi.string().allow(null, ''),
            ndoc: Joi.string().allow(null, ''),
            targa1: Joi.string().allow(null, ''),
            targa2: Joi.string().allow(null, ''),
            targa3: Joi.string().allow(null, ''),
            targa4: Joi.string().allow(null, ''),
        });
        return scheme.validate(data);
    }
};