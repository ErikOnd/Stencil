delete from public.prompts
where title = 'Write Client Reply'
  and body = 'Write a reply to this client message:

{{clientMessage}}

Goal of the reply: {{goal}}. Keep it {{tone}}, concise and professional. End with a clear next step.'
  and last_used_at is null;
