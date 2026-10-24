import Fuse from 'fuse.js'
import type { FeatureCollection } from 'geojson'
import type React from 'react'
import { memo, use, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, Text } from 'react-native'
import Divider from '@/components/Universal/divider'
import { MapContext } from '@/contexts/map'
import type { SearchResult, SelectMapElement } from '@/types/map'
import ResultRow from './search-result-row'

interface SearchResultsProps {
	allRooms: FeatureCollection
	selectMapElement: SelectMapElement
	searchQuery: string
	onClearSearch: () => void
}

const SearchResults = ({
	allRooms,
	selectMapElement,
	searchQuery,
	onClearSearch
}: SearchResultsProps): React.JSX.Element => {
	const { t, i18n } = useTranslation('common')
	const { searchHistory, updateSearchHistory } = use(MapContext)

	const fuse = useMemo(
		() =>
			new Fuse(
				allRooms.features.filter((f) => !f.properties?.hideSearch),
				{
					keys: [
						'properties.Raum',
						'properties.code',
						i18n.language === 'de'
							? 'properties.Funktion_de'
							: 'properties.Funktion_en',
						'properties.Gebaeude'
					],
					threshold: 0.4,
					useExtendedSearch: true
				}
			),
		[allRooms.features, i18n.language]
	)

	const [searchResultsExact, searchResultsFuzzy] = useMemo(() => {
		const results = fuse.search(searchQuery.trim().toUpperCase())
		const roomResults = results.map((result) => {
			const room = result.item.properties?.Raum as string | undefined
			return {
				title: room as string,
				subtitle: result.item.properties?.Funktion_en as string,
				isExactMatch: Boolean(
					room?.toUpperCase().includes(searchQuery.toUpperCase())
				),
				item: result.item
			}
		})

		const exactMatches = roomResults.filter((result) => result.isExactMatch)
		const fuzzyMatches = roomResults.filter((result) => !result.isExactMatch)

		return [exactMatches, fuzzyMatches]
	}, [fuse, searchQuery])

	const addToSearchHistory = useCallback(
		(newHistory: SearchResult): void => {
			const newSearchHistory = searchHistory.filter(
				(history) => history.title !== newHistory.title
			)

			newSearchHistory.unshift(newHistory)

			if (newSearchHistory.length > 5) {
				newSearchHistory.length = 5
			}

			updateSearchHistory(newSearchHistory)
		},
		[searchHistory, updateSearchHistory]
	)

	const renderItem = useCallback(
		({ item }: { item: SearchResult }): React.JSX.Element => (
			<ResultRow
				result={item}
				selectMapElement={selectMapElement}
				updateSearchHistory={addToSearchHistory}
				onClearSearch={onClearSearch}
			/>
		),
		[addToSearchHistory, onClearSearch, selectMapElement]
	)

	const renderSectionHeader = useCallback(
		({ section }: { section: { title: string; data: SearchResult[] } }) => (
			<Text className="text-text text-xl font-medium mb-0.5 pt-2 text-left">
				{section.title}
			</Text>
		),
		[]
	)

	const itemSeparator = useCallback(() => <Divider paddingLeft={50} />, [])

	const sectionListProps = useMemo(
		() => ({
			windowSize: 5,
			maxToRenderPerBatch: 10,
			updateCellsBatchingPeriod: 50,
			removeClippedSubviews: true,
			initialNumToRender: 10
		}),
		[]
	)

	return searchResultsExact.length > 0 || searchResultsFuzzy.length > 0 ? (
		<SectionList
			contentContainerClassName="pb-bottom-safe"
			keyboardShouldPersistTaps="always"
			sections={[
				...(searchResultsExact.length > 0
					? [
							{
								title: t('pages.map.search.results'),
								data: searchResultsExact
							}
						]
					: []),
				...(searchResultsFuzzy.length > 0
					? [
							{
								title: t('pages.map.search.fuzzy'),
								data: searchResultsFuzzy
							}
						]
					: [])
			]}
			keyExtractor={(item, index) => `${item.title}${index}`}
			renderItem={renderItem}
			extraData={onClearSearch}
			ItemSeparatorComponent={itemSeparator}
			stickySectionHeadersEnabled={false}
			renderSectionHeader={renderSectionHeader}
			{...sectionListProps}
		/>
	) : (
		<Text className="text-text text-base py-[30px] text-center">
			{t('pages.map.search.noResults')}
		</Text>
	)
}

export default memo(SearchResults)
