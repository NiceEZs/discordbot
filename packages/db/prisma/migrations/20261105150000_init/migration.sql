-- CreateEnum
CREATE TYPE "ModAction" AS ENUM ('WARN', 'MUTE', 'KICK', 'BAN', 'UNMUTE', 'UNBAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT DEFAULT '0',
    "avatar" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "ownerId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildSettings" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'pl',
    "moderationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "modLogChannelId" TEXT,
    "moderatorRoleId" TEXT,
    "muteDefaultMinutes" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModCase" (
    "id" TEXT NOT NULL,
    "caseNumber" INTEGER NOT NULL,
    "guildId" TEXT NOT NULL,
    "action" "ModAction" NOT NULL,
    "reason" TEXT,
    "targetDiscordId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "moderatorDiscordId" TEXT NOT NULL,
    "moderatorUserId" TEXT,
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_discordId_key" ON "Guild"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildSettings_guildId_key" ON "GuildSettings"("guildId");

-- CreateIndex
CREATE INDEX "ModCase_guildId_createdAt_idx" ON "ModCase"("guildId", "createdAt");

-- CreateIndex
CREATE INDEX "ModCase_targetDiscordId_idx" ON "ModCase"("targetDiscordId");

-- CreateIndex
CREATE UNIQUE INDEX "ModCase_guildId_caseNumber_key" ON "ModCase"("guildId", "caseNumber");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildSettings" ADD CONSTRAINT "GuildSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModCase" ADD CONSTRAINT "ModCase_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModCase" ADD CONSTRAINT "ModCase_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModCase" ADD CONSTRAINT "ModCase_moderatorUserId_fkey" FOREIGN KEY ("moderatorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
