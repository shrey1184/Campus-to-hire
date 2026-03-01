import re

with open("src/app/dashboard/interview/page.tsx", "r") as f:
    content = f.read()

setup_pattern = r'<div className="mx-auto max-w-lg rounded-2xl p-5 sm:p-6 card-dark">.*?<h2 className="mb-4 heading-md font-semibold">Setup Your Interview</h2>.*?<div className="space-y-4">.*?</div>\s+</div>'

setup_new = """<Card className="mx-auto max-w-lg border-primary/20 bg-card">
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

# use DOTALL
content = re.sub(setup_pattern, setup_new, content, flags=re.DOTALL)

with open("src/app/dashboard/interview/page.tsx", "w") as f:
    f.write(content)

