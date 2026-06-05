import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const campgrounds = pgTable("campgrounds", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  location: text("location").notNull(),
  ownerId: text("owner_id").notNull(),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  body: text("body").notNull(),
  rating: integer("rating").notNull(),
  campgroundId: uuid("campground_id").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const campgroundImages = pgTable("campground_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  campgroundId: uuid("campground_id").notNull(),
  url: text("url").notNull(),
  filename: text("filename"),
});
