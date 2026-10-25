-- CreateTable
CREATE TABLE "User_Access_Day" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_Access_Day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_Access_Day_userId_idx" ON "User_Access_Day"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_Access_Day_userId_date_key" ON "User_Access_Day"("userId", "date");

-- AddForeignKey
ALTER TABLE "User_Access_Day" ADD CONSTRAINT "User_Access_Day_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

