//  NAVIGATION
$(function(){
    function showSection(section){
        $('.page-section').removeClass('active');
        $('#section-' + section).addClass('active');
        $('.nav-item').removeClass('active');
        $('.nav-item[data-section="' + section + '"]')
            .addClass('active');
        window.scrollTo({
            top:0,
            behavior:'smooth'
        });
        if(window.innerWidth < 850){
            $('#sidebar').removeClass('open');
        }
    }
    function route(){
        var section =
            (location.hash || '#dashboard')
            .replace('#','');
        if(!$('#section-' + section).length){
            section = 'dashboard';
        }
        showSection(section);
    }
    $(window).on('hashchange', route);
    $('.nav-item').on('click', function(e){
        e.preventDefault();
        location.hash = $(this).data('section');
    });
    $('[data-go]').on('click', function(){
        location.hash = $(this).data('go');
    });
    route();
    // MOBILE SIDEBAR
    $('#mobileToggle').on('click', function(){
        $('#sidebar').toggleClass('open');
    });
    // TOAST
    function toast(message){
        $('#toastText').text(message);
        bootstrap.Toast
            .getOrCreateInstance(
                $('#appToast')[0],
                {
                    delay:2200
                }
            )
            .show();
    }
//   RISK CALCULATION
    function calculateRisk(data){
        var score = 18;
        var age =
            Number(data.age) || 0;
        var bp =
            Number(data.bp) || 0;
        var chol =
            Number(data.chol) || 0;
        var hr =
            Number(data.hr) || 0;
        var st =
            Number(data.st) || 0;
        if(age >= 60){
            score += 25;
        }else if(age >= 50){
            score += 18;
        }else if(age >= 40){
            score += 10;
        }
        if(bp >= 150){
            score += 18;
        }else if(bp >= 130){
            score += 10;
        }
        if(chol >= 260){
            score += 17;
        }else if(chol >= 220){
            score += 10;
        }
        if(hr > 0 && hr < 110){
            score += 12;
        }
        if(st >= 2){
            score += 14;
        }else if(st >= 1){
            score += 7;
        }
        if(
            data.chest === 'typical' ||
            data.chest === 'asymptomatic'
        ){
            score += 10;
        }
        if(data.angina === 'yes'){
            score += 10;
        }
        if(data.vessels === '2'){
            score += 8;
        }else if(data.vessels === '3'){
            score += 13;
        }else if(data.vessels === '1'){
            score += 4;
        }
        if(data.sugar === 'high'){
            score += 5;
        }
        return Math.max(
            5,
            Math.min(
                98,
                Math.round(score)
            )
        );
    }
    function dashboardData(){
        return {
            age:$('#age').val(),
            bp:$('#bp').val(),
            chol:$('#chol').val(),
            hr:$('#hr').val(),
            st:$('#st').val(),
            chest:$('#chest').val(),
            angina:$('#angina').val(),
            vessels:$('#vessels').val(),
            sugar:$('#sugar').val()
        };
    }
    function updateResult(score){
        $('#score').text(score + '%');
        $('#scoreRing').css(
            'background',
            'conic-gradient(#fa1d25 0 ' +
            score +
            '%,#3b292b ' +
            score +
            '%)'
        );
        if(score >= 50){
            $('#riskLevel')
                .text('High Risk')
                .css('color','#ff2730');
            $('#riskText').text(
                'The illustrative model predicts a higher chance of heart disease. Please consult a qualified doctor.'
            );
        }else{
            $('#riskLevel')
                .text('Low Risk')
                .css('color','#43d879');
            $('#riskText').text(
                'The illustrative model predicts a lower risk based on the entered values. Continue healthy habits and routine checkups.'
            );
        }
    }
    // DASHBOARD PREDICTION
    $('#predictBtn').on('click', function(){
        $('#validation').text('');
        var data = dashboardData();
        if(
            !data.age ||
            !data.bp ||
            !data.chol
        ){
            $('#validation').text(
                'Please enter at least Age, Blood Pressure and Cholesterol.'
            );
            return;
        }
        var score =
            calculateRisk(data);
        updateResult(score);
        toast(
            'Prediction calculated: ' +
            score +
            '% risk score'
        );
    });
    // DASHBOARD RESET
    $('#resetBtn').on('click', function(){
        $('#predictionForm input, #predictionForm select')
            .val('');
        $('#validation').text('');
        updateResult(78);
        toast('Prediction form reset');
    });
    // FULL PREDICTION PAGE
    $('#fullPredictBtn').on('click', function(){
        if(!$('#page').val()){
            $('#fullResult').html(
                '<span style="color:#ff6268">' +
                'Please enter the patient age.' +
                '</span>'
            );
            return;
        }
        var score = calculateRisk({
            age:$('#page').val(),
            bp:$('#pbp').val(),
            chol:$('#pchol').val(),
            hr:$('#phr').val(),
            st:$('#pst').val(),
            chest:$('#pchest').val(),
            angina:$('#pangina')
                .val()
                .toLowerCase(),
            vessels:$('#pvessels').val()
        });
        $('#fullResult').html(
            '<strong>Prediction complete:</strong> ' +
            score +
            '% risk score — ' +
            (
                score >= 50
                ? 'High Risk'
                : 'Low Risk'
            ) +
            '.'
        );
        toast(
            'Patient prediction completed'
        );
    });
    $('#fullResetBtn').on('click', function(){
        $('#section-predict input, #section-predict select')
            .val('');
        $('#fullResult').text(
            'Prediction output will appear here.'
        );
    });
//    PATIENT SEARCH
    $('#patientSearch').on('input', function(){
        var query =
            $(this)
            .val()
            .toLowerCase();
        var shown = 0;
        $('#patientsTable tbody tr')
            .each(function(){
                var match =
                    $(this)
                    .text()
                    .toLowerCase()
                    .indexOf(query) > -1;
                $(this).toggle(match);
                if(match){
                    shown++;
                }
            });
        $('#patientCount')
            .text(
                shown + ' records'
            );
    });
//    GLOBAL SEARCH
    $('#globalSearch').on(
        'keydown',
        function(e){
            if(e.key === 'Enter'){
                location.hash = 'patients';
                $('#patientSearch')
                    .val($(this).val())
                    .trigger('input');
            }
        }
    );
//    PATIENT MODAL
    $(document).on(
        'click',
        '.row-btn',
        function(){
            var cells =
                $(this)
                .closest('tr')
                .children();
            $('#modalBody').html(
                '<div class="row mb-2">' +
                '<div class="col-5 text-secondary">' +
                'Patient' +
                '</div>' +
                '<div class="col-7">' +
                cells.eq(1).text() +
                '</div>' +
                '</div>' +
                '<div class="row mb-2">' +
                '<div class="col-5 text-secondary">' +
                'Age' +
                '</div>' +
                '<div class="col-7">' +
                cells.eq(2).text() +
                '</div>' +
                '</div>' +
                '<div class="row mb-2">' +
                '<div class="col-5 text-secondary">' +
                'Risk' +
                '</div>' +
                '<div class="col-7">' +
                cells.eq(3).text() +
                '</div>' +
                '</div>' +
                '<div class="row mb-2">' +
                '<div class="col-5 text-secondary">' +
                'Score' +
                '</div>' +
                '<div class="col-7">' +
                cells.eq(4).text() +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-5 text-secondary">' +
                'Date' +
                '</div>' +
                '<div class="col-7">' +
                cells.eq(5).text() +
                '</div>' +
                '</div>'
            );
            bootstrap.Modal
                .getOrCreateInstance(
                    $('#patientModal')[0]
                )
                .show();
        }
    );
//    ADD PATIENT
    $('#addPatientBtn').on(
        'click',
        function(){
            location.hash = 'predict';
            toast(
                'Use Predict Disease to enter a new patient'
            );
        }
    );
//    REPORTS
    $('.report-action').on(
        'click',
        function(){
            var name =
                $(this).data('report');
            var reports = {
                'Risk Summary':
                    '<h2>Risk Summary</h2>' +
                    '<p>' +
                    '1,248 patients analyzed. ' +
                    '<b>312</b> are high risk and ' +
                    '<b>936</b> are low risk.' +
                    '</p>' +
                    '<p>' +
                    'High-risk share: <b>25%</b>. ' +
                    'Dashboard prediction accuracy: ' +
                    '<b>75%</b>.' +
                    '</p>',
                'Patient Activity':
                    '<h2>Patient Activity</h2>' +
                    '<p>' +
                    'Latest records include Ali Raza (82%), ' +
                    'Sara Khan (23%), Umar Farooq (76%), ' +
                    'Ayesha Malik (28%) and Bilal Ahmad (81%).' +
                    '</p>',
                'Model Performance':
                    '<h2>Model Performance</h2>' +
                    '<p>' +
                    'Current illustrative dashboard accuracy is ' +
                    '<b>75%</b>, with a reported 5% improvement ' +
                    'from the previous month.' +
                    '</p>'
            };
            $('#reportOutput').html(
                reports[name] +
                '<button ' +
                'class="btn-red mt-3" ' +
                'id="printReport">' +
                'Print / Save PDF' +
                '</button>'
            );
            toast(
                name + ' opened'
            );
        }
    );
    $(document).on(
        'click',
        '#printReport',
        function(){
            window.print();
        }
    );
    $('#generateReport').on(
        'click',
        function(){
            $('#reportOutput').html(
                '<h2>New Report</h2>' +
                '<p>' +
                'Report generated successfully at ' +
                new Date().toLocaleString() +
                '.' +
                '</p>' +
                '<button ' +
                'class="btn-red mt-3" ' +
                'id="printReport">' +
                'Print / Save PDF' +
                '</button>'
            );
            toast(
                'Report generated'
            );
        }
    );
//    SETTINGS
    $('#compactToggle').on(
        'change',
        function(){
            $('body')
                .toggleClass(
                    'compact',
                    this.checked
                );
            toast(
                this.checked
                ? 'Compact sidebar enabled'
                : 'Compact sidebar disabled'
            );
        }
    );
    $('#accentToggle').on(
        'change',
        function(){
            toast(
                'Accent setting updated'
            );
        }
    );
    $('#notifToggle').on(
        'change',
        function(){
            toast(
                this.checked
                ? 'Notifications enabled'
                : 'Notifications disabled'
            );
        }
    );
//   OUTSIDE CLICK
    $(document).on(
        'click',
        function(e){
            if(
                window.innerWidth < 850 &&
                $('#sidebar').hasClass('open') &&
                !$(e.target).closest(
                    '#sidebar,#mobileToggle'
                ).length
            ){
                $('#sidebar')
                    .removeClass('open');
            }
        }
    );
});