import { InferSelectModel } from "drizzle-orm";
import { files, folders, users, workspace } from "../../../migrations/schema";

export type workspace = InferSelectModel<typeof workspace>;
export type user = InferSelectModel<typeof users>;
export type folder = InferSelectModel<typeof folders>;
export type file = InferSelectModel<typeof files>;
// export type user=InferSelectModel<typeof users>
