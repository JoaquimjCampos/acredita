# 📅 Roadmap: Acredita em Ti, Acredita em Angola (Jira Scrum Upload)

## 🎯 Project Overview
- **Season:** Nova Temporada (Season 2)
- **Status:** Active
- **Registration:** 21–22 Aug 2025
- **Season Dates:** 23 Aug – 1 Sep 2025

## 🟢 Current State
- Backend: Django, modular apps, ready for educational games
- Frontend: React, separated and organized
- Documentation: Modular, with implementation plan for games

---

## 🏁 Sprint Review: Done vs To Do

### ✅ Done
- Backend refactored into modular Django apps (`backend/`)
- REST API endpoints finalized and documented
- Authentication improvements (JWT, CSRF, validation)
- Initial development of the `games` app (Quiz MVP: models, APIs)
- Donation and ads system integration started
- React frontend audited and refactored
- Quiz UI components implemented and connected to backend
- Dashboard, participant list, and profile pages improved
- Automated tests set up
- Staging environment prepared

### 🏃 To Do (Next Sprints)
1. Finalize quiz game logic and ranking APIs
   - Complete backend logic for quiz flow, scoring, and ranking.
   - Ensure APIs are season-aware (use `season.json` for current season context).
   - Add endpoints for retrieving rankings per season/episode.
   - Work in feature branches and use automated tests before merging.
   - Integrate new endpoints/enhancements without breaking existing code.

2. Complete donation and ads integration
   - Integrate payment gateway for donations in a separate module.
   - Connect ads system to backend and frontend using feature flags.
   - Ensure donations and ads are tracked per season, keeping legacy data intact.
   - Use incremental rollout to avoid disruption.

3. Polish dashboard and participant features
   - Refactor UI components incrementally, using mock data and staging environments.
   - Add new filters and sorting as enhancements, not replacements.
   - Validate changes with user feedback before production.

4. Ensure all automated tests pass
   - Run tests before every merge and maintain high coverage.
   - Add tests for new features, season logic, donations, and ranking APIs.
   - Use CI/CD to catch regressions early.

5. Prepare for user testing
   - Deploy to staging environment first, using feature toggles for new features.
   - Create test scenarios for quiz, donations, dashboard, and participant features.
   - Collect feedback and iterate before production release.

---

## 🗺️ 3-Month Roadmap (Scrum Epics & Stories)

### Epic 1: Foundation & MVP Delivery
- Refactor Django apps into `backend/`
- Finalize/document REST API endpoints
- Implement authentication improvements (JWT, CSRF, validation)
- Develop `games` app (Quiz MVP)
  - Models: Question, Answer, Match, Score
  - API endpoints for quiz logic/ranking
- Integrate donation/ads systems with games
- Audit/refactor React code
- Implement quiz UI components
- Improve dashboard, participant list/profile pages
- Set up automated tests
- Prepare staging environment

### Epic 1b: Season Management & Episodes
- Implement season-aware logic in backend and frontend
- Create models/APIs for seasons and episodes
- Integrate season.json metadata into dashboards and APIs
- Develop UI for season registration, episode schedule, and current status
- Ensure voting, registration, and game features are season-aware

### Epic 2: Feature Expansion & Gamification
- Expand `games` app: word games, simulator, association
- Implement badges, achievements, public ranking APIs
- Optimize DB queries, add Redis cache
- Build UI for new games
- Integrate gamification elements
- Add notifications, real-time updates
- Increase test coverage
- Monitor performance/logs
- Collect feedback, iterate

### Epic 2b: Continuous Improvement & Future Features
- Add online store and payment gateway integration
- Develop educational content modules (courses, videos, podcasts)
- Implement blog/news and notification systems
- Integrate analytics endpoints and dashboards
- Plan for mobile app and advanced analytics

### Epic 3: Polish, Launch & Scale
- Finalize all game features/APIs
- Integrate payment gateway for donations/store
- Add analytics endpoints
- Prepare for production deployment
- Polish UI/UX, implement store/educational content
- Add social sharing/mobile optimizations
- Finalize accessibility
- Set up CI/CD pipeline
- Final user testing/bug fixing
- Launch system to production
- Monitor/support/plan next phase

### Epic 3b: Season Transition & Retrospective
- Prepare system for next season (update season.json, migrate data)
- Conduct sprint retrospective and gather feedback
- Archive previous season’s data and results
- Plan next roadmap based on lessons learned

---

## 📝 Jira Scrum Details

### Epics
- Foundation & MVP
- Feature Expansion
- Polish & Launch
- Season Management & Episodes
- Continuous Improvement & Future Features
- Season Transition & Retrospective

### Stories (Sample)
- Refactor backend structure
- Implement quiz game models/APIs
- Build quiz UI components
- Integrate donations
- Add word games
- Gamification features
- Optimize performance
- Finalize store/educational content
- Prepare for launch
- Implement season registration and episode schedule
- Integrate season.json into dashboard and APIs
- Develop voting system for current season
- Add educational content modules
- Integrate analytics and reporting
- Prepare for next season transition

### Tasks
- Backend migration
- API documentation
- Frontend refactor
- Test automation
- User feedback collection
- Production deployment
- Season data migration
- Update season.json for new season
- Archive previous season results
- Sprint retrospective documentation

---

## 📊 Milestones
- End Month 1: MVP quiz game live, refactored backend/frontend, staging ready
- End Month 2: All core games/gamification features, user feedback incorporated
- End Month 3: Full system launch, online store, educational content, production deployment
- End Month 3: Season transition completed, retrospective documented, next roadmap planned

---

## 📂 Attachments
- season.json (current season details)
- API documentation (to be exported)
- UI wireframes (to be exported)
- Sprint retrospective notes
- Season transition checklist

---

## 🔗 Notes
- All features, releases, and sprints should align with the current season dates.
- Use this document to create Jira epics, stories, and tasks for the next 3 months.
- Update weekly based on sprint progress and feedback.
- Avoid redundant stories/tasks by reviewing completed work before planning new sprints.
- Ensure season management and transition are part of every roadmap update.

---

*Generated by GitHub Copilot, 07/09/2025*
*Last updated after deep review for sprint and season harmonization.*
