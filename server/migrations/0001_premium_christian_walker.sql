ALTER TABLE "chat_message" DROP CONSTRAINT "chat_message_chat_id_chat_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;