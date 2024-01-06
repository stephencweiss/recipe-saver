-- CreateTable
CREATE TABLE "event_guests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "rsvp" TEXT,
    "role" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_guests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_guests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
