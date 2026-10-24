import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION } from '@/types/campus-life'
import CampusLifeEventsCard from './campus-life-events-card'
export default function EventsCard(): React.JSX.Element {
	return (
		<CampusLifeEventsCard
			title="events"
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION}
			listRoute="/campus-life-events"
		/>
	)
}
