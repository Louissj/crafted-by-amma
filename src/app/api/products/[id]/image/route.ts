import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { validateFile } from '@/lib/security';
import { uploadToS3 } from '@/lib/s3';

// POST /api/products/[id]/image — admin only, upload a product image
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const validation = validateFile(file);
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

    const imageUrl = await uploadToS3(file, 'products');

    const currentImages = Array.isArray(product.images) ? product.images as string[] : [];
    const updatedImages = [...currentImages, imageUrl];

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { images: updatedImages },
    });

    return NextResponse.json({ url: imageUrl, images: updated.images });
  } catch (e) {
    console.error('Image upload error:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE /api/products/[id]/image — admin only, remove an image URL from the array
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url } = await req.json();
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const currentImages = Array.isArray(product.images) ? product.images as string[] : [];
    const updatedImages = currentImages.filter(img => img !== url);

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { images: updatedImages },
    });
    return NextResponse.json({ images: updated.images });
  } catch {
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 });
  }
}
