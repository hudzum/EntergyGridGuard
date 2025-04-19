import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel, DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreHorizontal} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription, DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Pole} from "@/components/tableFilterComps/columns.tsx";
import {NewMap, PoleWithLocation} from "@/map/NewMap.tsx";

export interface PoleInfoPopupProps {
	pole: Pole
}

const getConditionColor = (condition: string) => {
	switch (condition.toLowerCase()) {
		case 'good':
			return 'bg-green-500';
		case 'fair':
			return 'bg-yellow-500';
		case 'poor':
			return 'bg-orange-500';
		case 'bad':
			return 'bg-red-500';
		default:
			return 'bg-gray-500';
	}
};

export const PoleInfoPopup: React.FC<PoleInfoPopupProps> = ({pole}) => {
	return (
		<DialogContent className="sm:max-w-2xl ">
			<DialogHeader>
				<DialogTitle>Component Status for Pole #{pole.id}</DialogTitle>
				<DialogDescription>
					Detailed overview of all components and their current status.
				</DialogDescription>
			</DialogHeader>

			<Card className="w-full shadow">
				<CardTitle className="text-xl font-bold text-center">
					Components Status Pole #{pole.id}
				</CardTitle>

				<CardContent className="p-6">
					<div className="grid grid-cols-2 gap-2">
						<img src={`/api/images/${pole.id}/data`} style={{width: '100%', height: '100%'}}/>
						<div style={{position: 'relative', width: '100%', height: '100%'}}>
							<img src={`/api/images/${pole.id}/data`} />
							<p style={{top: 0, left: 0, width: '100%', lineHeight: '12px', textTransform: 'capitalize', height: '100%', position: 'absolute', padding: 5, color: 'orange', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', fontWeight: 'bold'}}>
								{Object.entries(pole.components).filter(([, data]) => data.quantity > 0).map(([name, data]) => (
									<>
										<span style={{margin: 0, }}>{name} ({data.quantity}) - </span>
										<span style={{margin: 0, color: ({bad: 'oklch(0.637 0.237 25.331)', good: 'oklch(0.723 0.219 149.579)', unknown: 'oklch(0.551 0.027 264.364)'}[data.condition] ?? 'white')}}>{data.condition}</span>
										<br />
										<span style={{margin: '0 0 0 20px', fontSize: 8}}>{data.description}</span>
										<br />
									</>
								))}
							</p>
						</div>
					</div>
					{pole.longitude && pole.latitude ? (
						<div style={{marginLeft: 'auto', overflow: 'hidden', marginRight: 'auto', marginTop: 10, marginBottom: 10, width: '80%', pointerEvents: 'none', position: 'relative', border: '1px solid black', borderRadius: 10}}>
							<NewMap initialPos={{
								center: [pole.longitude, pole.latitude],// Initial map center [lng, lat]
								zoom: 15, // Initial zoom level
								pitch: 76,
								bearing: 76,
							}} searchBar={false} highlightImageId={pole.id} images={[pole as PoleWithLocation]} style="street" />

							<a target="_blank" href={`/map?pole=${pole.id}`} style={{color: 'white', fontWeight: 'bold', fontSize: 20, display: 'grid', placeItems: 'center', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', pointerEvents: 'all'}}>
								View on Map
							</a>
						</div>
					) : (
						<p style={{marginTop: 10, marginBottom: 10}}><b>Pole does not have gps info.</b></p>
					)}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{pole.components && Object.entries(pole.components).map(([name, data]) => (
							<Card key={name} className="overflow-hidden">
								<div className="p-4 border-b bg-slate-50 flex justify-between items-center">
									<h3 className="font-medium capitalize">{name}</h3>
									<Badge className={getConditionColor(data.condition)}>
										{data.condition}
									</Badge>
								</div>
								<div className="p-4 space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">Quantity:</span>
										<span className="font-semibold">{data.quantity}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">Description:</span>
										<span className="text-sm mt-1">{data.description}</span>
									</div>
								</div>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			<DialogFooter>
				<Button type="button">Close</Button>
				<Button type="button" variant="outline">Generate Report</Button>
			</DialogFooter>
		</DialogContent>
	);
}
