// types/inscripcion.ts
import * as z from "zod";

export const contactSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(7, "Teléfono inválido"),
  diocesis: z.string().min(1, "Seleccione una diócesis"),
  entidadSalud: z.string().min(1, "Seleccione su EPS"),
  segmentacion: z.string().min(1, "Seleccione su rol"),
  hospedaje: z.enum(["si", "no"]),
  imagen: z.any()
    .refine((files) => files?.length > 0, "El comprobante es obligatorio")
    .refine((files) => files?.[0]?.size <= 5000000, "Máximo 5MB")
});

export type ContactFormData = z.infer<typeof contactSchema>;