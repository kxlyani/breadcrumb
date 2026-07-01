-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "FixApproach" AS ENUM ('CODE_CHANGE', 'CONFIG_CHANGE', 'DEPENDENCY_UPDATE', 'INFRASTRUCTURE', 'OTHER');

-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stack_traces" (
    "id" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "exceptionType" TEXT,
    "exceptionMessage" TEXT,
    "language" TEXT,
    "frames" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "stack_traces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "root_causes" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "identifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "root_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixes" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "approach" "FixApproach" NOT NULL DEFAULT 'CODE_CHANGE',
    "affectedFiles" TEXT[],
    "commitRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "fixes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "issue_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_tags" (
    "issueId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "issue_tags_pkey" PRIMARY KEY ("issueId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "stack_traces_issueId_key" ON "stack_traces"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "root_causes_issueId_key" ON "root_causes"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "fixes_issueId_key" ON "fixes"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_workspaceId_name_key" ON "tags"("workspaceId", "name");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stack_traces" ADD CONSTRAINT "stack_traces_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_causes" ADD CONSTRAINT "root_causes_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixes" ADD CONSTRAINT "fixes_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_notes" ADD CONSTRAINT "issue_notes_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tags" ADD CONSTRAINT "issue_tags_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tags" ADD CONSTRAINT "issue_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
