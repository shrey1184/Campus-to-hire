import re

with open("src/app/dashboard/roadmap/page.tsx", "r") as f:
    content = f.read()

# Replace Imports
imports = """import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
"""

content = re.sub(r'import \{ useEffect,\s*useState \} from "react";', 
                 imports + '\nimport { useEffect, useState } from "react";', content)

# Replace Loading
loading_old = """      <div className="flex h-64 items-center justify-center">
        <div className="rounded-xl px-8 py-6 text-center card-glass pulse-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary spinner-glow" />
          <p className="mt-3 text-micro text-muted-foreground">Loading roadmap nodes...</p>
        </div>
      </div>"""

loading_new = """      <div className="flex h-64 items-center justify-center">
        <Card className="px-8 py-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading roadmap nodes...</p>
        </Card>
      </div>"""

content = content.replace(loading_old, loading_new)

# Replace Generate Button
btn_old = """        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60 sm:w-auto btn-accent"
        >"""

btn_new = """        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full sm:w-auto gap-2"
        >"""

content = content.replace(btn_old, btn_new)
content = content.replace("        </button>", "        </Button>")

# Replace Generating Progress
gen_prog_old = """        <div className="rounded-xl p-4 card-dark">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary spinner-glow" />
              Generating Week {generatingWeek} of {roadmap.total_weeks}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {Math.round(((generatingWeek - 1) / roadmap.total_weeks) * 100)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-primary to-amber-600 transition-all duration-500"
              style={{
                width: `${((generatingWeek - 1) / roadmap.total_weeks) * 100}%`,
              }}
            />
          </div>
        </div>"""

gen_prog_new = """        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Generating Week {generatingWeek} of {roadmap.total_weeks}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {Math.round(((generatingWeek - 1) / roadmap.total_weeks) * 100)}%
              </span>
            </div>
            <Progress value={((generatingWeek - 1) / roadmap.total_weeks) * 100} className="h-2.5" />
          </CardContent>
        </Card>"""

content = content.replace(gen_prog_old, gen_prog_new)

# Replace Overall Progress
prog_old = """          <div className="rounded-xl p-4 card-dark">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">
                Week {roadmap.current_week} of {roadmap.total_weeks}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {Math.round(((roadmap.current_week - 1) / roadmap.total_weeks) * 100)}% complete
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-primary to-amber-600 transition-all"
                style={{
                  width: `${((roadmap.current_week - 1) / roadmap.total_weeks) * 100}%`,
                }}
              />
            </div>
          </div>"""

prog_new = """          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  Week {roadmap.current_week} of {roadmap.total_weeks}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(((roadmap.current_week - 1) / roadmap.total_weeks) * 100)}% complete
                </span>
              </div>
              <Progress value={((roadmap.current_week - 1) / roadmap.total_weeks) * 100} className="h-2.5" />
            </CardContent>
          </Card>"""
          
content = content.replace(prog_old, prog_new)

# Replace No Roadmap Yet card
no_rm_old = """        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center card-dark">
          <Map className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">No Roadmap Yet</h2>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Click &quot;Generate Roadmap&quot; to create a personalized learning path
            based on your profile, target role, and skill level.
          </p>
        </div>"""

no_rm_new = """        <Card className="flex flex-col items-center justify-center border-dashed py-16 text-center shadow-none">
          <Map className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">No Roadmap Yet</h2>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Click &quot;Generate Roadmap&quot; to create a personalized learning path
            based on your profile, target role, and skill level.
          </p>
        </Card>"""

content = content.replace(no_rm_old, no_rm_new)

# Subbing "Current" tag
content = re.sub(r'<span className="rounded-full bg-primary/20 px-2 py-0\.5 text-xs font-medium text-primary">\s*Current\s*</span>', r'<Badge variant="secondary">Current</Badge>', content)

# Subbing Task Tag
task_tag_pattern = r'<span className={`rounded-full px-2 py-0\.5 text-\[10px\] font-medium capitalize \$\{\s*task\.type === "learn"\s*\? "bg-primary/20 text-primary"\s*: task\.type === "practice"\s*\? "bg-amber-500/15 text-amber-700 dark:text-amber-300"\s*: task\.type === "interview"\s*\? "bg-orange-500/15 text-orange-700 dark:text-orange-300"\s*: "bg-secondary text-secondary-foreground"\s*\}`}>\s*\{task\.type\}\s*</span>'
content = re.sub(task_tag_pattern, r'<Badge variant="outline" className="capitalize text-[10px]">{task.type}</Badge>', content)

with open("src/app/dashboard/roadmap/page.tsx", "w") as f:
    f.write(content)

