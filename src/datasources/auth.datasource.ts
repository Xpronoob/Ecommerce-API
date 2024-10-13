import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { JwtAdapter } from "../adapters/jwt.adapter"
import { CustomError } from "../errors/custom.error"
import { convertToMillisencods } from "../utils/converters"
import { envs } from "../configs/envs"

const prisma = new PrismaClient()

type SignToken = (payload: Object, duration?: number) => Promise<string | null>

export class AuthDatasource {
constructor(
    private readonly signAccessToken: SignToken = JwtAdapter.generateAccessToken,
    private readonly signRefreshToken: SignToken = JwtAdapter.generateRefreshToken,
  ) {}

  async register(validatedData: {email: string, password: string, first_name?: string, last_name?: string, phone_number?: string}) {
    const { email, password, first_name, last_name, phone_number } = validatedData

    const isRegistered = await prisma.users.findFirst({
      where: { email: email}
    })

    if (isRegistered) {
      throw CustomError.badRequest("El usuario ya existe")
    }

    const user = await prisma.users.create({
      data: {
        email,
        password,
        first_name,
        last_name,
        phone_number
      },
    })

    const payload = {
      email: user.email,
      first_name: user.first_name,
    }

    const accessToken = await this.signAccessToken(payload)
    const refreshToken = await this.signRefreshToken(payload)

    if (!accessToken || !refreshToken) throw CustomError.internalServer('Error generating token')

    const userSession = await prisma.sessions.create({
      data: {
        user_id: user.user_id,
        refresh_token: refreshToken,
        expires_at: new Date(new Date().getTime() + convertToMillisencods(envs.COOKIE_EXPIRES_REFRESH_TOKEN))
      }
    })

    const userWithTokens = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      accessToken,
      refreshToken
    }

    return userWithTokens
   }

  async login() {
    console.log("using login datasource")
  }

  async logout() {
    console.log("using logout datasource")
  }

}