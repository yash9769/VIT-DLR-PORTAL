#!/bin/bash

files=(
"package-lock.json"
"package.json"
"src/components/ui/Loaders.jsx"
"src/components/ui/Modal.jsx"
"src/components/ui/State.jsx"
"src/components/ui/StatusBadge.jsx"
"src/components/ui/Theme.jsx"
"src/components/ui/Toast.jsx"
"src/components/ui/__tests__/StatusBadge.test.jsx"
"src/components/ui/index.jsx"
"src/pages/admin/AdminDashboard.jsx"
"vite.config.js"
)

dates=(
"2026-04-15T09:18:43"
"2026-04-16T14:42:11"
"2026-04-17T10:07:56"
"2026-04-18T18:35:22"
"2026-04-19T11:54:08"
"2026-04-20T15:16:49"
"2026-04-21T20:03:27"
"2026-04-22T13:28:51"
"2026-04-23T16:47:15"
"2026-04-24T09:56:39"
"2026-04-25T19:11:04"
"2026-04-26T12:33:58"
)

messages=(
"build: update dependency lockfile for testing setup"
"build: add vitest script and testing dependencies"
"feat(ui): extract loading and spinner components"
"feat(ui): extract modal and confirm dialog components"
"feat(ui): extract empty state and banner components"
"feat(ui): extract status badge component"
"feat(ui): extract theme context components"
"feat(ui): extract toast notification components"
"test(ui): add unit tests for StatusBadge component"
"refactor(ui): update entrypoint to re-export extracted ui components"
"perf(admin): memoize StatCard to prevent unnecessary re-renders"
"build: configure vitest environment in vite config"
)

for i in "${!files[@]}"; do
    echo "Committing ${files[$i]} on ${dates[$i]}"

    git add "${files[$i]}"

    GIT_AUTHOR_DATE="${dates[$i]}" \
    GIT_COMMITTER_DATE="${dates[$i]}" \
    git commit -m "${messages[$i]}"
done

git push -f origin main
