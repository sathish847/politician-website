var THEMEREX_validateForm = null;

function userSubmitForm(form, url, nonce) {
  "use strict";

  // Clear any previous validation states
  form.find(".error_fields_class").removeClass("error_fields_class");
  form.find(".field-success").removeClass("field-success");

  var error = false;
  var form_custom = form.data("formtype");

  if (form_custom == "contact_1") {
    // Enhanced validation with better user feedback
    error = formValidate(form, {
      error_message_show: true,
      error_message_time: 5000,
      error_message_class: "sc_infobox sc_infobox_style_error",
      error_fields_class: "error_fields_class",
      exit_after_first_error: false,
      rules: [
        {
          field: "username",
          min_length: { value: 1, message: THEMEREX_NAME_EMPTY },
          max_length: { value: 60, message: THEMEREX_NAME_LONG },
        },
        {
          field: "email",
          min_length: { value: 7, message: THEMEREX_EMAIL_EMPTY },
          max_length: { value: 60, message: THEMEREX_EMAIL_LONG },
          mask: {
            value: THEMEREX_EMAIL_MASK,
            message: THEMEREX_EMAIL_NOT_VALID,
          },
        },
        {
          field: "mobile",
          min_length: {
            value: 10,
            message: "Please enter a valid mobile number (minimum 10 digits)",
          },
          max_length: { value: 15, message: "Mobile number is too long" },
          mask: {
            value: /^[0-9+\-\s()]+$/,
            message: "Please enter a valid mobile number",
          },
        },
        {
          field: "message",
          min_length: {
            value: 10,
            message: "Please enter a message with at least 10 characters",
          },
          max_length: {
            value: THEMEREX_msg_maxlength_contacts,
            message: THEMEREX_MESSAGE_LONG,
          },
        },
      ],
    });

    // Add visual feedback for successful fields
    if (!error) {
      form
        .find(
          'input[name="username"], input[name="email"], input[name="mobile"], textarea[name="message"]'
        )
        .each(function () {
          if ($(this).val().trim() !== "") {
            $(this).addClass("field-success");
          }
        });
    }
  } else if (form_custom == "grievance") {
    // Grievance form validation
    error = formValidate(form, {
      error_message_show: true,
      error_message_time: 5000,
      error_message_class: "sc_infobox sc_infobox_style_error",
      error_fields_class: "error_fields_class",
      exit_after_first_error: false,
      rules: [
        {
          field: "fullname",
          min_length: {
            value: 2,
            message: "முழு பெயர் தேவை (குறைந்தது 2 எழுத்துகள்)",
          },
          max_length: { value: 50, message: "பெயர் மிகவும் நீளமானது" },
        },
        {
          field: "email",
          min_length: { value: 7, message: "மின்னஞ்சல் முகவரி தேவை" },
          max_length: {
            value: 60,
            message: "மின்னஞ்சல் முகவரி மிகவும் நீளமானது",
          },
          mask: {
            value: THEMEREX_EMAIL_MASK,
            message: "சரியான மின்னஞ்சல் முகவரியை உள்ளீடு செய்யவும்",
          },
        },
        {
          field: "phone",
          min_length: {
            value: 10,
            message: "தொலைபேசி எண் தேவை (குறைந்தது 10 இலக்கங்கள்)",
          },
          max_length: { value: 15, message: "தொலைபேசி எண் மிகவும் நீளமானது" },
          mask: {
            value: /^[0-9+\-\s()]+$/,
            message: "சரியான தொலைபேசி எண்ணை உள்ளீடு செய்யவும்",
          },
        },
        {
          field: "constituency",
          min_length: { value: 1, message: "தொகுதியை தேர்ந்தெடுக்கவும்" },
        },
        {
          field: "message",
          min_length: {
            value: 10,
            message: "குறை விவரம் தேவை (குறைந்தது 10 எழுத்துகள்)",
          },
          max_length: {
            value: 1000,
            message:
              "குறை விவரம் மிகவும் நீளமானது (அதிகபட்சம் 1000 எழுத்துகள்)",
          },
        },
      ],
    });

    // Add visual feedback for successful fields
    if (!error) {
      form
        .find(
          'input[name="fullname"], input[name="email"], input[name="phone"], select[name="constituency"], textarea[name="message"]'
        )
        .each(function () {
          if ($(this).val().trim() !== "") {
            $(this).addClass("field-success");
          }
        });
    }
  }

  if (!error) {
    THEMEREX_validateForm = form;

    // Show loading state
    var submitBtn = form.find(".sc_contact_form_submit");
    var originalText = submitBtn.html();
    submitBtn
      .html('<span class="icon-spin"></span> Sending...')
      .prop("disabled", true);

    // Check if EmailJS is loaded
    if (typeof emailjs === "undefined") {
      submitBtn.html(originalText).prop("disabled", false);
      userSubmitFormResponse(
        '{"error":"Email service is currently unavailable. Please try again later."}'
      );
      return;
    }

    // Prepare template parameters based on form type
    var templateParams = {};
    if (form_custom == "contact_1") {
      templateParams = {
        from_name: form.find('input[name="username"]').val().trim(),
        from_email: form.find('input[name="email"]').val().trim(),
        mobile: form.find('input[name="mobile"]').val().trim(),
        message: form.find('textarea[name="message"]').val().trim(),
        to_name: "K.S. Moorthi",
      };
    } else if (form_custom == "grievance") {
      templateParams = {
        from_name: form.find('input[name="fullname"]').val().trim(),
        from_email: form.find('input[name="email"]').val().trim(),
        phone: form.find('input[name="phone"]').val().trim(),
        constituency: form.find('select[name="constituency"]').val().trim(),
        message: form.find('textarea[name="message"]').val().trim(),
        to_name: "K.S. Moorthi District Secretary",
      };
    }

    // Send email using EmailJS
    emailjs
      .send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      )
      .then(
        function (response) {
          // Restore button and show success
          submitBtn.html(originalText).prop("disabled", false);
          showSuccessAlert(form_custom);
          userSubmitFormResponse('{"error":""}');
        },
        function (error) {
          // Restore button and show error
          submitBtn.html(originalText).prop("disabled", false);
          userSubmitFormResponse(
            '{"error":"Failed to send email. Please check your internet connection and try again."}'
          );
        }
      );
  }
}

// Function to show success alert
function showSuccessAlert(formType) {
  // Show simple browser alert with English message
  if (formType == "grievance") {
    alert("Email sent successfully!");
  } else {
    alert("Email sent successfully!");
  }
}

function userSubmitFormResponse(response) {
  "use strict";
  var rez = JSON.parse(response);
  var result = THEMEREX_validateForm.find(".result")
    .toggleClass("sc_infobox_style_error", false)
    .toggleClass("sc_infobox_style_success", false);
  if (rez.error == "") {
    result.addClass("sc_infobox_style_success").html(THEMEREX_SEND_COMPLETE);
    setTimeout(function () {
      result.fadeOut();
      THEMEREX_validateForm.get(0).reset();
    }, 3000);
  } else {
    result
      .addClass("sc_infobox_style_error")
      .html(THEMEREX_SEND_ERROR + " " + rez.error);
  }
  result.fadeIn();
}
