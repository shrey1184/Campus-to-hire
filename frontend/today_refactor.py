import re

with open("src/app/dashboard/today/page.tsx", "r") as f:
    content = f.read()

# Replace top imports
imports = """import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
"""

content = re.sub(r'import \{ useEffect, useState, useCallback \} from "react";', 
                 imports + '\nimport { useEffect, useState, useCallback } from "react";', content)

# Loading state
loading_old = """      <div className="flex h-64 items-center justify-center">
        <div className="rounded-xl px-8 py-6 text-center card-glass pulse-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary spinner-glow" />
          <p className="mt-3 text-micro text-muted-foreground">Preparing today&apos;s tasks...</p>
        </div>
      </div>"""

loading_new = """      <div className="flex h-64 items-center justify-center">
        <Card className="px-8 py-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Preparing today&apos;s tasks...</p>
        </Card>
      </div>"""

content = content.replace(loading_old, loading_new)

# No Plan State
noplan_old = """      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Plan For Today</h2>
        <p className="text-sm text-muted-foreground">
          Generate a roadmap first to get daily plans.
        </p>
      </div>"""

noplan_new = """      <Card className="flex flex-col items-center justify-center py-16 text-center shadow-none border-dashed">
        <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Plan For Today</h2>
        <p className="text-sm text-muted-foreground">
          Generate a roadmap first to get daily plans.
        </p>
      </Card>"""

content = content.replace(noplan_old, noplan_new)

# Summary blocks
summary_old = """      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl p-4 text-center card-dark">
          <p className="text-xl font-bold text-primary sm:text-2xl">{completed}/{total}</p>
          <p className="text-xs text-muted-foreground">Tasks Done</p>
        </div>
        <div className="rounded-xl p-4 text-center card-dark">
          <p className="text-xl font-bold sm:text-2xl">{pct}%</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
        <div className="rounded-xl p-4 text-center card-dark">
          <p className="flex items-center justify-center gap-1 text-xl font-bold sm:text-2xl">
            <Clock className="h-4 w-4" />
            {Math.round(totalMinutes / 60 * 10) / 10}h
          </p>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </div>
      </div>"""

summary_new = """      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-primary sm:text-2xl">{completed}/{total}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold sm:text-2xl">{pct}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="flex items-center justify-center gap-1 text-xl font-bold sm:text-2xl">
              <Clock className="h-4 w-4" />
              {Math.round(totalMinutes / 60 * 10) / 10}h
            </p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </CardContent>
        </Card>
      </div>"""

content = content.replace(summary_old, summary_new)

# Progress Bar
prog_old = """      {/* Progress bar */}
      <div className="rounded-xl p-4 card-dark">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Daily Progress</span>
          <span className="text-muted-foreground tabular-nums">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted">
          <div
            className={`h-3 rounded-full transition-all ${
              allDone
                ? "bg-gradient-to-r from-primary to-amber-500"
                : "bg-gradient-to-r from-primary to-amber-600"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>"""

prog_new = """      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Daily Progress</span>
            <span className="text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} className="h-3" />
        </CardContent>
      </Card>"""
      
content = content.replace(prog_old, prog_new)

# All Done Banner
banner_old = """      {/* All done banner */}
      {allDone && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 card-glass">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <p className="font-semibold text-primary">
              All tasks completed.
            </p>
            <p className="text-sm text-muted-foreground">
              Great job today! Come back tomorrow for new tasks.
            </p>
          </div>
        </div>
      )}"""
      
banner_new = """      {/* All done banner */}
      {allDone && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-primary">
                All tasks completed.
              </p>
              <p className="text-sm text-muted-foreground">
                Great job today! Come back tomorrow for new tasks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}"""

content = content.replace(banner_old, banner_new)

# Task List
task_old = """          <div
            key={task.id}
            className={`flex items-start gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition ${
              task.completed
                ? "border-primary/40 bg-primary/10 card-glass"
                : "border-border/50 bg-card hover:border-primary/30 card-dark card-interactive"
            }`}
          >"""

task_new = """          <Card
            key={task.id}
            className={`transition-colors ${
              task.completed
                ? "border-primary/40 bg-primary/5"
                : "hover:border-primary/30"
            }`}
          >
            <CardContent className="flex items-start gap-3 p-4 sm:gap-4">"""

content = content.replace(task_old, task_new)


# Re-closing the task card
task_close_old = """                {task.type}
              </span>
            </div>
          </div>"""

task_close_new = """                {task.type}
              </Badge>
            </div>
            </CardContent>
          </Card>"""

# Need to accurately replace the task closing, but it's tricky since there's multiple closing divs
# Let's do it carefully using regex.

content = re.sub(r'<span\s+className={`rounded-full px-2 py-0.5 text-\[10px\] font-medium capitalize \$\{\s*TASK_TYPE_COLORS\[task.type\] \|\| "bg-secondary text-secondary-foreground"\s*}`}\s*>\s*\{task.type\}\s*</span>\s*</div>\s*</div>',
                 r'<Badge variant={task.completed ? "secondary" : "default"} className="capitalize capitalize text-[10px]">{task.type}</Badge></div></CardContent></Card>', content)

with open("src/app/dashboard/today/page.tsx", "w") as f:
    f.write(content)

