import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'reached auth route' })
}

export async function POST() {
  return NextResponse.json({ message: 'reached auth route' })
}
