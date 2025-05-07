import { View, Text, Image, ScrollView, TouchableOpacity} from "react-native";
import { useUser } from "../lib/auth";
import { useRoutes } from "../features/routes/api/get-routes";
import { useSets } from "../features/sets/api/get-sets";
import { useCircuits } from "../features/circuits/api/get-circuits";
import { useActivities } from "../features/activities/api/get-activities";
import { useAllClimbs } from "../features/climbs/api/get-all-climbs";
import { act } from "react";
import { colorsPastel, colors, colorsHex } from "../types/colors";
import { Circuit, Climb, Route, Set } from "../types/routes";

export default function Tab() {
    const user = useUser();
    const routes = useRoutes().data || {};
    const sets = useSets().data || {};
    const circuits = useCircuits().data?.data || {};
    const circuitsOrder = useCircuits().data?.order || [];
    const climbs = useAllClimbs().data || [];
    const activities = useActivities().data || [];
    
    return (
        <ScrollView>
            
            {activities.map((activity) => (
                <View key={activity.username + activity.time} style={{ padding: 10, marginTop: 10, backgroundColor: 'white' }}>
                    <Text style={{ fontWeight: 'bold', color: '#1F2937' }}>
                        {activity.has_profile_photo ? (
                            <Image
                                source={{ uri: `https://depot.douvk.co.uk/api/profile_photo/${activity.user}` }}
                                style={{ borderRadius: 50, width: 36, height: 36 }}
                            />
                        ) : null}
                        {activity.username}
                    </Text>
                    <Text>{new Date(activity.time).toDateString()}</Text>
                    {/* Add more activity details here */}


                    <View style={{ margin: 4, marginTop: 16, flexDirection: "row", gap: 8 }}>
                        {circuitsOrder
                            .map((circuit_id) => circuits[circuit_id])
                            .map((circuit) => {
                                const circuitClimbCount = activity.climb_ids.filter(
                                    (climbId) =>
                                        sets[
                                            routes[
                                                climbs.find((climb) => climb.id === climbId)?.route
                                            ]?.set_id
                                        ]?.circuit_id === circuit.id
                                ).length;

                                return (
                                    circuitClimbCount > 0 && (
                                        <View
                                            key={circuit.id}
                                            style={{
                                                padding: 4,
                                                paddingHorizontal: 12,
                                                borderRadius: 9999,
                                                backgroundColor: colorsPastel[circuits[circuit.id].color],
                                            }}
                                        >
                                            <Text style={{ color: "white" }}>
                                                {circuitClimbCount}{" "}
                                                {circuitClimbCount > 1 ? "sends" : "send"}
                                            </Text>
                                        </View>
                                    )
                                );
                            })}
                    </View>

                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={{ flex: 1,paddingBottom: 32, padding:8, rowGap: 16, columnGap: 16 }}
                        contentContainerStyle={{ flexDirection: "row", paddingBottom: 16,rowGap: 16, columnGap: 16 }}
                    >
                        {activity.climb_ids.map((climbId) => {
                            const climb = climbs.find((c) => c.id === climbId);
                            return (
                                climb && (
                                    <RouteCardProfile
                                        key={climb.route + climbId}
                                        route={routes[climb.route]}
                                        circuits={circuits}
                                        sets={sets}
                                        climb={climb}
                                        setSidebarRoute={() => {}}
                                    />
                                )
                            );
                        })}
                    </ScrollView>    
                </View>

                
            ))}
            
        </ScrollView>
    );
}

export function RouteCardProfile(props: {
    route: Route;
    circuits: Record<string, Circuit>;
    sets: Record<string, Set>;
    climb: Climb;
    setSidebarRoute: (route: string) => void;
}) {
    if (props.route === undefined) {
        return <View />;
    }

    const days_since =
        new Date().getDate() - new Date(props.climb.time).getDate();

    const day_text =
        days_since === 0
            ? "Today"
            : days_since === 1
            ? "Yesterday"
            : days_since + " days ago";

    return (
        <TouchableOpacity
            style={{
                width: 144,
                maxWidth: "100%",
                borderRadius: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                backgroundColor: "white",
                marginBottom: 16,
            }}
            onPress={() => props.setSidebarRoute(props.route.id)}
        >
            <View style={{ backgroundColor: "white", position: "relative" }}>
                <Image
                    style={{
                        borderRadius: 8,
                        // width: "100%",
                        height: 100,
                    }}
                    source={{ uri: `https://depot.douvk.co.uk/api/img_thumb/${props.route.id}.webp` }}
                />
                <View
                    style={{
                        position: "absolute",
                        bottom: 4,
                        margin: 4,
                        padding: 4,
                        paddingHorizontal: 12,
                        borderRadius: 4,
                        backgroundColor: props.sets[props.route.set_id]
                            ? colorsHex[
                                    props.circuits[props.sets[props.route.set_id].circuit_id]
                                        .color
                                ]
                            : "gray",
                    }}
                >
                    <Text style={{ color: "white" }}>{props.route.name}</Text>
                </View>
                <View
                    style={{
                        position: "absolute",
                        bottom: -20,
                        width: "100%",
                        textAlign: "center",
                        fontSize: 12,
                        padding: 4,
                        color: "#4B5563",
                    }}
                >
                    <Text>{day_text}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
