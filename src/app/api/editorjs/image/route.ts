import { z } from 'zod';
import cloudinary from 'cloudinary';
import { cloudinaryConfig } from '@/configs';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    console.log(formData.get('image'));

    const { image: validatedImage } = await z
      .object({
        image: z
          .any()
          .refine((file: File) => !Boolean(file), `Image cannot be empty`)
          .refine(
            (file: File) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            'Only .jpg, .jpeg, .png and .webp formats are supported.'
          ),
      })
      .parseAsync(formData.get('image'));

    console.log(validatedImage);

    const customCloudinary = cloudinary;
    customCloudinary.v2.config(cloudinaryConfig);

    const response = await customCloudinary.v2.uploader.upload(validatedImage);

    return new Response(JSON.stringify({ image_url: response.secure_url }), {
      status: 200,
    });
  } catch (error) {}
}

export const config = {
  api: {
    bodyParser: false,
  },
};
