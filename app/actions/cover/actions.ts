"use server";
import { prisma } from "@/lib/prisma";
export async function setCoverImage(data: { pageId: string; cover: string }) {
  try {
    await prisma.page.update({
      where: {
        id: data.pageId,
      },
      data: {
        cover: data.cover,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function removeCoverImage(data: { pageId: string }) {
  try {
    await prisma.page.update({
      where: {
        id: data.pageId,
      },
      data: {
        cover: null,
      },
    });
  } catch (error) {
    console.log(error);
  }
}
