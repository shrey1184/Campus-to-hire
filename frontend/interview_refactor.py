import re

with open("src/app/dashboard/interview/page.tsx", "r") as f:
    content = f.read()

# Replace Imports
imports = """import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
"""

content = re.sub(r'import \{ useState, useRef, useEffect \} from "react";', 
                 imports + '\nimport { useState, useRef, useEffect } from "react";', content)

# Card wrapping setup and form elements
setup_old = """        <div className="mx-auto max-w-lg rounded-2xl p-5 sm:p-6 card-dark">
          <h2 className="mb-4 heading-md font-semibold">Setup Your Interview</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Target Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none input-dark"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Company (optional)
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none input-dark"
              >
                <option value="">General Interview</option>
                {TARGET_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold disabled:opacity-60 btn-accent"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin spinner-glow" />
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Interview
                </>
              )}
            </button>
          </div>
        </div>"""

setup_new = """        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Setup Your Interview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company (optional)</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="General Interview" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="none">General Interview</SelectItem>
                  {TARGET_COMPANIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStart}
              disabled={starting}
              className="w-full mt-4"
              size="lg"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Interview
                </>
              )}
            </Button>
          </CardContent>
        </Card>"""
content = content.replace(setup_old, setup_new)

# Re-routing 'none' logic for company (since SelectItem can't have empty string value if we want to handle it easily, wait we can just replace 'none' in handleStart)
content = content.replace('const iv = await interviewApi.start(selectedRole, selectedCompany || undefined);', 'const iv = await interviewApi.start(selectedRole, selectedCompany && selectedCompany !== "none" ? selectedCompany : undefined);')

# Header buttons
content = content.replace("""<button
              onClick={handleEnd}
              disabled={ending}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground btn-outline"
            >""", """<Button variant="outline" size="sm" onClick={handleEnd} disabled={ending} className="gap-2">""")
content = content.replace("End\n            </button>", "End\n            </Button>")
content = content.replace("""<button
            onClick={handleNewInterview}
            className="rounded-lg px-3 py-1.5 text-xs font-medium btn-outline"
          >
            New Interview
          </button>""", """<Button variant="secondary" size="sm" onClick={handleNewInterview}>New Interview</Button>""")

# Messsage avatars
assistant_avatar_old = """            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}"""
assistant_avatar_new = """            {msg.role === "assistant" && (
              <Avatar className="h-8 w-8 bg-primary/10">
                <AvatarFallback className="text-primary bg-transparent"><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            )}"""
content = content.replace(assistant_avatar_old, assistant_avatar_new)

user_avatar_old = """            {msg.role === "user" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <User className="h-4 w-4" />
              </div>
            )}"""
user_avatar_new = """            {msg.role === "user" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground"><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            )}"""
content = content.replace(user_avatar_old, user_avatar_new)

# Score card
score_card_old = """        {isFinished && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center card-glass">
            <Trophy className="mx-auto mb-2 h-10 w-10 text-primary" />
            <p className="text-2xl font-bold">{interview.score}/100</p>
            <div className="mx-auto mb-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    s <= Math.round((interview.score || 0) / 20)
                      ? "fill-primary text-primary"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            {interview.feedback && (
              <div className="text-left text-sm">
                <p className="mb-1 font-semibold">Feedback:</p>
                <ReactMarkdown>{interview.feedback}</ReactMarkdown>
              </div>
            )}
          </div>
        )}"""
score_card_new = """        {isFinished && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Trophy className="mx-auto mb-2 h-10 w-10 text-primary" />
              <p className="text-2xl font-bold">{interview.score}/100</p>
              <div className="mx-auto mb-4 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-5 w-5 ${
                      s <= Math.round((interview.score || 0) / 20)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              {interview.feedback && (
                <div className="text-left text-sm">
                  <p className="mb-2 font-semibold">Feedback:</p>
                  <ReactMarkdown>{interview.feedback}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        )}"""
content = content.replace(score_card_old, score_card_new)

# Input Box
input_old = """        <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your answer..."
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none disabled:opacity-50 input-dark"
          />
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 btn-accent"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin spinner-glow" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>"""
input_new = """        <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your answer..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>"""
content = content.replace(input_old, input_new)

with open("src/app/dashboard/interview/page.tsx", "w") as f:
    f.write(content)

