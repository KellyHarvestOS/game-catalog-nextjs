BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Game] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [genre] NVARCHAR(1000),
    [platform] NVARCHAR(1000),
    [developer] NVARCHAR(1000),
    [publisher] NVARCHAR(1000),
    [releaseDate] DATETIME2,
    [price] FLOAT(53),
    [coverImageUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Game_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Game_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Screenshot] (
    [id] NVARCHAR(1000) NOT NULL,
    [url] NVARCHAR(1000) NOT NULL,
    [gameId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Screenshot_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PurchasedGame] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [gameId] NVARCHAR(1000) NOT NULL,
    [purchasedAt] DATETIME2 NOT NULL CONSTRAINT [PurchasedGame_purchasedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PurchasedGame_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PurchasedGame_userId_gameId_key] UNIQUE NONCLUSTERED ([userId],[gameId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Game_title_idx] ON [dbo].[Game]([title]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Game_genre_idx] ON [dbo].[Game]([genre]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Screenshot_gameId_idx] ON [dbo].[Screenshot]([gameId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PurchasedGame_userId_idx] ON [dbo].[PurchasedGame]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PurchasedGame_gameId_idx] ON [dbo].[PurchasedGame]([gameId]);

-- AddForeignKey
ALTER TABLE [dbo].[Screenshot] ADD CONSTRAINT [Screenshot_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [dbo].[Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PurchasedGame] ADD CONSTRAINT [PurchasedGame_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PurchasedGame] ADD CONSTRAINT [PurchasedGame_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [dbo].[Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
