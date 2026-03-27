-- CreateTable
CREATE TABLE "_DepotToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepotToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DepotToProduct_B_index" ON "_DepotToProduct"("B");

-- AddForeignKey
ALTER TABLE "_DepotToProduct" ADD CONSTRAINT "_DepotToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Depot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepotToProduct" ADD CONSTRAINT "_DepotToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
