import Joi from "joi";

export default class Validator {

    static login(data: unknown) {
        const schema = Joi.object({
          cliente: Joi.string().min(3).max(32).required(),
          postazione: Joi.string().min(3).max(32).required(),
          username: Joi.string().min(5).max(32).required(),
          password: Joi.string().min(6).required(),
        });
        
        return schema.validate(data);
    }

    static register(data: unknown) {
        const schema = Joi.object({
          username: Joi.string().min(6).max(32).required(),
          password: Joi.string().min(6).required(),
          admin: Joi.bool(),
        });
    
        return schema.validate(data);
    }

    static logout(data: unknown) {
      const schema = Joi.object({
        id: Joi.string().required(),
      });

      return schema.validate(data);
    }
    
    static badgeDoc(data: unknown) {
        const schema = Joi.object({
          barcode: Joi.string().min(3).max(32).required(),
          descrizione: Joi.string().valid(null, ""),
          tipo: Joi.string().valid(null, ""),
          assegnazione: Joi.string().valid(null, ""),
          stato: Joi.string().valid(null, ""),
          ubicazione: Joi.string().valid(null, ""),
          nome: Joi.string().valid(null, ""),
          cognome: Joi.string().valid(null, ""),
          telefono: Joi.string().valid(null, ""),
          ditta: Joi.string().valid(null, ""),
          tdoc: Joi.string().valid(null, ""),
          ndoc: Joi.string().valid(null, ""),
          scadenza: Joi.string().valid(null, ""),
          targa1: Joi.string().valid(null, ""),
          targa2: Joi.string().valid(null, ""),
          targa3: Joi.string().valid(null, ""),
          targa4: Joi.string().valid(null, ""),
        });

        return schema.validate(data);
    }

    static enumDoc(data: unknown) {
        const scheme = Joi.object({
          badge: Joi.string().required(),
          name: Joi.string().required(),
        });

        return scheme.validate(data);
    }

    static timbra(data: unknown) {
        const scheme = Joi.object({
          barcode: Joi.string().min(3).max(32).required(),
          cliente: Joi.string().required(),
          postazione: Joi.string().required(),
          nome: Joi.string().valid(null, ""),
          cognome: Joi.string().valid(null, ""),
          ditta: Joi.string().valid(null, ""),
          telefono: Joi.string().valid(null, ""),
          tdoc: Joi.string().valid(null, ""),
          ndoc: Joi.string().valid(null, ""),
          targa1: Joi.string().valid(null, ""),
          targa2: Joi.string().valid(null, ""),
          targa3: Joi.string().valid(null, ""),
          targa4: Joi.string().valid(null, ""),
        });

        return scheme.validate(data);
    }

    static postDocumento(data: unknown) {
      const scheme = Joi.object({
        codice: Joi.string().required(),
        nome: Joi.string().required(),
        cognome: Joi.string().required(),
        azienda: Joi.string().required(),
      });

      return scheme.validate(data);
    }

    static putDocumento(data: unknown) {
      const scheme = Joi.object({
        codice: Joi.string().required(),
        nome: Joi.string().valid(null, ""),
        cognome: Joi.string().valid(null, ""),
        azienda: Joi.string().valid(null, ""),
      });

      return scheme.validate(data);
    }

    static postCalendario(data: unknown) {
      const scheme = Joi.object({
        date: Joi.string().required()
      });

      return scheme.validate(data);
    }

    static deleteCalendario(data: unknown) {
      const scheme = Joi.object({
        date: Joi.string().required(),
        filename: Joi.string().required()
      });

      return scheme.validate(data);
    }

    static prestitoChiave(data: unknown) {
      const scheme = Joi.object({
        barcodes: Joi.array().required(),
        cliente: Joi.string().required(),
        postazione: Joi.string().required(),
      });

      return scheme.validate(data);
    }
    
}