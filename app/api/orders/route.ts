import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createOrder } from "@/lib/data/orders";

export async function POST(request: Request) {
  try {
    const order = await createOrder(await request.json());
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "validation_error", message: "Invalid order payload." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "order_error", message: error instanceof Error ? error.message : "Could not create order." },
      { status: 400 }
    );
  }
}
