package main

/*
#cgo CFLAGS: -I/path/to/swiss_ephemeris/src
#cgo LDFLAGS: -L/path/to/swiss_ephemeris/src -lswe -lm
#include "swephexp.h"
#include <stdlib.h>
*/
import (
	"C"
	"errors"
	"fmt"
	"log"
	"math"
	"time"
	"unsafe"
)

// Planet names and Swiss Ephemeris constants for planets
// SE_SUN=0, SE_MOON=1, SE_MERCURY=2, etc.
var planetList = []struct {
	name  string
	sweID int
}{
	{"Sun", C.SE_SUN},
	{"Moon", C.SE_MOON},
	{"Mercury", C.SE_MERCURY},
	{"Venus", C.SE_VENUS},
	{"Mars", C.SE_MARS},
	{"Jupiter", C.SE_JUPITER},
	{"Saturn", C.SE_SATURN},
	{"Uranus", C.SE_URANUS},
	{"Neptune", C.SE_NEPTUNE},
	{"Pluto", C.SE_PLUTO},
}

// Planet holds the name and its longitude in the zodiac
type Planet struct {
	Name      string
	Longitude float64 // 0 to 360 degrees
}

type NatalChart struct {
	Planets []Planet
}

type TransitChart struct {
	Planets []Planet
}

// BirthData for natal calculation
type BirthData struct {
	Year, Month, Day, Hour, Minute int
	Latitude, Longitude            float64
}

// TransitData for today's calculation
type TransitData struct {
	Year, Month, Day, Hour, Minute int
}

// Convert date/time to Julian Day Number using Swiss Ephemeris
func julianDay(year, month, day int, hour float64) float64 {
	// Gregorian Calendar
	return float64(C.swe_julday(C.int(year), C.int(month), C.int(day), C.double(hour), C.int(C.SE_GREG_CAL)))
}

// setEphemerisPath sets the path to the Swiss Ephemeris data files
func setEphemerisPath(path string) {
	cPath := C.CString(path)
	defer C.free(unsafe.Pointer(cPath))
	C.swe_set_ephe_path(cPath)
}

// closeSwissEphemeris closes the ephemeris
func closeSwissEphemeris() {
	C.swe_close()
}

// calculatePlanets returns planetary positions for a given Julian Day
func calculatePlanets(jd float64) ([]Planet, error) {
	var xx [6]C.double
	var serr [256]C.char
	// Flags: Ephemeris, speed, etc.
	// Here we use: SEFLG_SWIEPH for Swiss Ephemeris, SEFLG_SPEED for speed
	iflag := C.int(C.SEFLG_SWIEPH | C.SEFLG_SPEED)

	planets := []Planet{}
	for _, p := range planetList {
		ret := C.swe_calc(C.double(jd), C.int(p.sweID), iflag, &xx[0], &serr[0])
		if ret < 0 {
			return nil, errors.New("Error calculating planet " + p.name + ": " + C.GoString(&serr[0]))
		}
		// xx[0] = ecliptic longitude in degrees
		// xx[1] = ecliptic latitude in degrees
		planets = append(planets, Planet{Name: p.name, Longitude: float64(xx[0])})
	}

	return planets, nil
}

// CalculateNatalChart computes the natal planetary positions
func CalculateNatalChart(b BirthData) (NatalChart, error) {
	// Convert local time to UTC if needed - for simplicity assume UTC here.
	hour := float64(b.Hour) + float64(b.Minute)/60.0
	jd := julianDay(b.Year, b.Month, b.Day, hour)

	planets, err := calculatePlanets(jd)
	if err != nil {
		return NatalChart{}, err
	}

	return NatalChart{Planets: planets}, nil
}

// CalculateTransitPositions computes today's transit planetary positions
func CalculateTransitPositions(t TransitData) (TransitChart, error) {
	hour := float64(t.Hour) + float64(t.Minute)/60.0
	jd := julianDay(t.Year, t.Month, t.Day, hour)

	planets, err := calculatePlanets(jd)
	if err != nil {
		return TransitChart{}, err
	}

	return TransitChart{Planets: planets}, nil
}

// CompareCharts - Very simplified: just checks if any transit planet is near a natal planet (conjunction)
func CompareCharts(n NatalChart, tr TransitChart) []string {
	// Example: If any transit planet is within 5 degrees of a natal planet, note it
	outlook := []string{}
	for _, np := range n.Planets {
		for _, tp := range tr.Planets {
			diff := angleDifference(np.Longitude, tp.Longitude)
			if math.Abs(diff) < 5.0 {
				// A simplistic interpretation of a conjunction
				outlook = append(outlook, fmt.Sprintf("Transit %s is close to your natal %s, indicating a strong focus on related themes today.", tp.Name, np.Name))
			}
		}
	}
	return outlook
}

// InterpretTransits turns the list of "transits found" into a message
func InterpretTransits(transits []string) string {
	if len(transits) == 0 {
		return "Today looks relatively calm with no major cosmic influences."
	}
	result := "Daily Outlook:\n"
	for _, t := range transits {
		result += "- " + t + "\n"
	}
	return result
}

// angleDifference returns the smallest angular difference
func angleDifference(a, b float64) float64 {
	diff := a - b
	for diff > 180 {
		diff -= 360
	}
	for diff < -180 {
		diff += 360
	}
	return diff
}

// Example usage
func main() {
	// Set the path to your ephemeris data files
	// Download the data files from: https://www.astro.com/swisseph/
	// and place them in /path/to/ephemeris/files/
	ephemerisPath := "/path/to/ephemeris/files/"
	setEphemerisPath(ephemerisPath)

	defer closeSwissEphemeris()

	birth := BirthData{
		Year: 1990, Month: 5, Day: 10, Hour: 14, Minute: 30,
		Latitude: 40.7128, Longitude: -74.0060,
	}

	// Current date/time (use UTC for simplicity)
	now := time.Now().UTC()
	today := TransitData{
		Year: now.Year(), Month: int(now.Month()), Day: now.Day(),
		Hour: now.Hour(), Minute: now.Minute(),
	}

	natalChart, err := CalculateNatalChart(birth)
	if err != nil {
		log.Fatalf("Error calculating natal chart: %v", err)
	}

	transitChart, err := CalculateTransitPositions(today)
	if err != nil {
		log.Fatalf("Error calculating transit chart: %v", err)
	}

	transits := CompareCharts(natalChart, transitChart)
	prediction := InterpretTransits(transits)

	fmt.Println(prediction)
}
