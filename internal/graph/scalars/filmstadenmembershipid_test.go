package scalars

import "testing"

func TestFilmstadenMembershipID_Valid(t *testing.T) {
	tests := []struct {
		name string
		id   FilmstadenMembershipID
		want bool
	}{
		{
			name: "happy flow",
			id:   FilmstadenMembershipID("ABC-XYZ"),
			want: true,
		},
		{
			name: "lowercase",
			id:   FilmstadenMembershipID("xyz-abc"),
			want: false,
		},
		{
			name: "one lowercase",
			id:   FilmstadenMembershipID("XyZ-ABC"),
			want: false,
		},
		{
			name: "without dash",
			id:   FilmstadenMembershipID("XYZABC"),
			want: false,
		},
		{
			name: "with space",
			id:   FilmstadenMembershipID("XYZ ABC"),
			want: false,
		},
		{
			name: "less than three chars",
			id:   FilmstadenMembershipID("XY-ABC"),
			want: false,
		},
		{
			name: "less than three chars, right",
			id:   FilmstadenMembershipID("XYZ-AC"),
			want: false,
		},
		{
			name: "more than three chars",
			id:   FilmstadenMembershipID("XYZZ-ABC"),
			want: false,
		},
		{
			name: "more than three chars, right",
			id:   FilmstadenMembershipID("XYZ-ABCC"),
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.id.Valid(); got != tt.want {
				t.Errorf("Valid() = %v, want %v", got, tt.want)
			}
		})
	}
}
